<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseCreateRequest;
use App\Http\Requests\ExpenseUpdateRequest;
use App\Http\Resources\ExpenseCollection;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use DB;

class ExpenseController extends Controller
{
    /**
     * Search expenses based on logged in user's company
     */
    public function search(Request $request): ExpenseCollection
    {
        $page = $request->input('page', 1);
        $size = $request->input('size', 10);
        $sort = $request->input('sortBy', 0);
        
        // OTOMATIS: Ambil company_id dari user yang login
        $user = Auth::user();
        $companyId = $user->company_id;

        $query = Expense::query()->with('category', 'company');

        // Filter agar hanya menampilkan data milik perusahaan user tersebut
        $query->where('company_id', $companyId);

        $query->where(function (Builder $builder) use ($request) {
            $search = $request->input('search');
            if ($search) {
                $builder->where('name', 'like', '%' . $search . '%');
            }
        });

        // Logika Sorting
        if ($sort == 0 || $sort == 1) {
            $query->orderBy('date', 'desc');
        } elseif ($sort == 2) {
            $query->orderBy('date', 'asc');
        } elseif ($sort == 3) {
            $query->orderBy('name', 'asc');
        } elseif ($sort == 4) {
            $query->orderBy('name', 'desc');
        }

        $result = $query->paginate(perPage: $size, page: $page);

        return new ExpenseCollection($result);
    }

    /**
     * Get all expenses for current company
     */
    public function all(): ExpenseCollection
    {
        $user = Auth::user();
        $query = Expense::query()
            ->with('category', 'company')
            ->where('company_id', $user->company_id)
            ->get();

        return new ExpenseCollection($query);
    }

    /**
     * Create expense with automatic company_id assignment
     */
    public function create(ExpenseCreateRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = Auth::user();

        try {
            DB::beginTransaction();
            
            $query = new Expense();
            // PAKSA: Menggunakan company_id dari user yang login, bukan dari input FE
            $query->company_id  = $user->company_id;
            $query->date        = $data['date'];
            $query->name        = $data['name'];
            $query->category_id = $data['category_id'];
            $query->amount      = $data['amount'];
            $query->description = $data['description'];

            if ($request->hasFile('proof')) {
                $url = $this->uploadToS3($request->file('proof'), 'expenses');
                $query->proof = $url;
            } else {
                $query->proof = 'https://is3.cloudhost.id/vras/shoescare/expenses/no_img.png';
            }

            $query->save();
            DB::commit();

            $query->load('category', 'company');
            return (new ExpenseResource($query))->response()->setStatusCode(201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function get(int $id): ExpenseResource
    {
        $user = Auth::user();
        // Pastikan user hanya bisa akses data perusahaannya sendiri
        $query = Expense::where('id', $id)
            ->where('company_id', $user->company_id)
            ->with('category', 'company')
            ->first();

        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => ["message" => ["not found"]]
            ])->setStatusCode(404));
        }

        return new ExpenseResource($query);
    }

    public function update(int $id, ExpenseUpdateRequest $request): ExpenseResource|JsonResponse
    {
        $user = Auth::user();
        $query = Expense::where('id', $id)
            ->where('company_id', $user->company_id)
            ->first();

        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => ["message" => ["not found"]]
            ])->setStatusCode(404));
        }

        $data = array_filter($request->validated());
        try {
            DB::beginTransaction();

            if (isset($data['date'])) $query->date = $data['date'];
            if (isset($data['name'])) $query->name = $data['name'];
            if (isset($data['category_id'])) $query->category_id = $data['category_id'];
            if (isset($data['amount'])) $query->amount = $data['amount'];
            if (isset($data['description'])) $query->description = $data['description'];

            if ($request->hasFile('proof')) {
                if ($query->proof && $query->proof != 'https://is3.cloudhost.id/vras/shoescare/expenses/no_img.png') {
                    $this->deleteFromS3($query->proof);
                }
                $url = $this->uploadToS3($request->file('proof'), 'expenses');
                $query->proof = $url;
            }

            $query->save();
            $query->load('category', 'company');
            DB::commit();

            return new ExpenseResource($query);
        } catch (\Exception $e) {
            DB::rollBack();
            throw new HttpResponseException(response()->json([
                'message' => 'Update failed',
                'error'   => $e->getMessage(),
            ], 500));
        }
    }

    public function delete(int $id): JsonResponse
    {
        $user = Auth::user();
        $query = Expense::where('id', $id)
            ->where('company_id', $user->company_id)
            ->first();

        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => ["message" => ["not found"]]
            ])->setStatusCode(404));
        }

        if ($query->proof && $query->proof != 'https://is3.cloudhost.id/vras/shoescare/expenses/no_img.png') {
            $this->deleteFromS3($query->proof);
        }

        $query->delete();
        return response()->json(['data' => true])->setStatusCode(200);
    }

    public function export(Request $request)
    {
        $user = Auth::user();
        // Export hanya data milik perusahaan yang login
        $data = Expense::query()
            ->with('category')
            ->where('company_id', $user->company_id)
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['No', 'Tanggal', 'Nama', 'Kategori', 'Keterangan', 'Nominal'];
        $column = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($column . '1', $header);
            $column++;
        }

        $row = 2;
        foreach ($data as $index => $item) {
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $item->date);
            $sheet->setCellValue('C' . $row, $item->name);
            $sheet->setCellValue('D' . $row, $item->category ? $item->category->name : '-');
            $sheet->setCellValue('E' . $row, $item->description ?? '-');
            $sheet->setCellValue('F' . $row, $item->amount);
            $sheet->getStyle('F' . $row)->getNumberFormat()->setFormatCode('#,##0');
            $row++;
        }

        $filename = 'Export Data Pengeluaran ' . now()->timestamp . '.xlsx';
        $writer = new Xlsx($spreadsheet);

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment;filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ]);
    }
}