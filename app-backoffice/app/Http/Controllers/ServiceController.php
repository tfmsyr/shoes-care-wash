<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceCreateRequest;
use App\Http\Requests\ServiceUpdateRequest;
use App\Http\Resources\ServiceCollection;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ServiceController extends Controller
{
    /**
     * SIMPAN DATA BARU (Create)
     */
    public function create(ServiceCreateRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Otomatis set company_id dari user yang login agar data terisolasi per perusahaan
        $data['company_id'] = Auth::user()->company_id;

        if ($request->hasFile('photo')) {
            $data['photo'] = $this->uploadToS3($request->file('photo'), 'services');
        } else {
            $data['photo'] = 'https://is3.cloudhost.id/vras/shoescare/services/no_img.png';
        }

        $service = Service::create($data);

        return (new ServiceResource($service))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * SEARCH & PAGINATION
     * Digunakan untuk tabel utama di frontend dengan fitur search, filter, dan sort.
     */
    public function search(Request $request): ServiceCollection
    {
        $page      = $request->input('page', 1);
        $size      = $request->input('size', 10);
        $sort      = $request->input('sortBy', 0);
        $status    = $request->input('status', 'all');
        $companyId = Auth::user()->company_id;

        $query = Service::query()
            ->with(['category', 'company'])
            ->where('company_id', $companyId);

        // Filter Pencarian (Code atau Name)
        if ($search = $request->input('search')) {
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('code', 'like', '%' . $search . '%')
                        ->orWhere('name', 'like', '%' . $search . '%');
            });
        }

        // Filter Status (Aktif/Non-aktif)
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Logika Pengurutan (Sorting)
        switch ($sort) {
            case 2: 
                $query->orderBy('created_at', 'asc'); 
                break;
            case 3: 
                $query->orderBy('name', 'asc'); 
                break;
            case 4: 
                $query->orderBy('name', 'desc'); 
                break;
            default: 
                $query->orderBy('created_at', 'desc'); 
                break;
        }

        return new ServiceCollection($query->paginate(perPage: $size, page: $page));
    }

    /**
     * AMBIL DETAIL SATU DATA (Get by ID)
     */
    public function get(int $id): ServiceResource
    {
        $service = Service::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->first();

        if (!$service) {
            throw new HttpResponseException(response([
                "errors" => ["message" => ["Layanan tidak ditemukan."]]
            ], 404));
        }

        return new ServiceResource($service);
    }

    /**
     * UPDATE DATA
     */
    public function update(int $id, ServiceUpdateRequest $request): ServiceResource
    {
        $service = Service::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->first();

        if (!$service) {
            throw new HttpResponseException(response([
                "errors" => ["message" => ["Layanan tidak ditemukan."]]
            ], 404));
        }

        $data = $request->validated();

        if ($request->hasFile('photo')) {
            if ($service->photo && $service->photo !== 'https://is3.cloudhost.id/vras/shoescare/services/no_img.png') {
                $this->deleteFromS3($service->photo);
            }
            $data['photo'] = $this->uploadToS3($request->file('photo'), 'services');
        }

        $service->update($data);

        return new ServiceResource($service);
    }

    /**
     * HAPUS DATA (Delete)
     */
    public function delete(int $id): JsonResponse
    {
        $service = Service::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->first();

        if (!$service) {
            throw new HttpResponseException(response([
                "errors" => ["message" => ["Layanan tidak ditemukan."]]
            ], 404));
        }

        $service->delete();
        return response()->json(["data" => true]);
    }

    /**
     * AMBIL SEMUA DATA (Tanpa Pagination)
     * Cocok digunakan untuk kebutuhan dropdown di form transaksi (Service Order).
     */
    public function all(): ServiceCollection
    {
        $services = Service::with(['category', 'company'])
            ->where('company_id', Auth::user()->company_id)
            ->get();

        return new ServiceCollection($services);
    }

    /**
     * EXPORT KE EXCEL (.xlsx)
     */
    public function export()
    {
        $data = Service::with('category')
            ->where('company_id', Auth::user()->company_id)
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Menyusun Header Kolom
        $headers = ['No', 'Kode', 'Nama', 'Kategori', 'Harga', 'Diskon'];
        $columnIndex = 1;
        foreach ($headers as $header) {
            $sheet->setCellValueByColumnAndRow($columnIndex, 1, $header);
            $columnIndex++;
        }

        // Mengisi Data Baris demi Baris
        $row = 2;
        foreach ($data as $index => $item) {
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $item->code);
            $sheet->setCellValue('C' . $row, $item->name);
            $sheet->setCellValue('D' . $row, $item->category->name ?? '-');
            $sheet->setCellValue('E' . $row, $item->price);
            $sheet->setCellValue('F' . $row, $item->discount);
            $row++;
        }

        $filename = 'Export_Layanan_' . now()->format('Ymd_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        
        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
            'Cache-Control' => 'max-age=0',
        ]);
    }
}
