<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompanyCreateRequest;
use App\Http\Requests\CompanyUpdateRequest;
use App\Http\Requests\CompanyUpdateStatusRequest;
use App\Http\Requests\CompanyUpdateManageRequest;

use App\Http\Resources\CompanyCollection;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\File;
use Hash;
use DB;

class CompanyController extends Controller
{

    public function manage(Request $request): CompanyResource
    {
        $query = Company::where('id', $request->user()->company_id)->first();
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => [
                    "message" => [
                        "not found"
                    ]
                ]
            ])->setStatusCode(404));
        }
        return new CompanyResource($query);
    }

    public function updateManage(CompanyUpdateManageRequest $request)
    {

        $query = Company::where('id', Auth()->user()->company_id)->first();
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => [
                    "message" => [
                        "not found"
                    ]
                ]
            ])->setStatusCode(404));
        }

        $data = array_filter($request->validated(), function ($value) {
            return $value !== null;
        });
        
        try {
            DB::beginTransaction();
            if (isset($data['name'])) {
                $query->name = $data['name'];
            }
            if (isset($data['email'])) {
                $query->email = $data['email'];
            }
            if (isset($data['address'])) {
                $query->address = $data['address'];
            }
            if (isset($data['phone'])) {
                $query->phone = $data['phone'];
            }
            if (isset($data['timezone'])) {
                $query->timezone = $data['timezone'];
            }
            if ($request->hasFile('logo')) {
                $folder      = "logos";
                if ($query->logo && $query->logo !='https://is3.cloudhost.id/vras/shoescare/logos/logo.png') {
                    $this->deleteFromS3($query->logo);
                }
                $url         = $this->uploadToS3($request->file('logo'), $folder);
                $query->logo = $url;
            }
            $query->save();
            DB::commit();
            return new CompanyResource($query);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function search(Request $request): CompanyCollection
    {
        $page     = $request->input('page', 1);
        $size     = $request->input('size', 10);
        $sort     = $request->input('sortBy',0);
        $query    = Company::query();
        $query    = $query->where(function (Builder $builder) use ($request) {
            $search = $request->input('search');
            if ($search) {
                $builder->where(function (Builder $builder) use ($search) {
                    $builder->orWhere('name', 'like', '%' . $search . '%');
                    $builder->orWhere('referral_code', 'like', '%' . $search . '%');
                    $builder->orWhere('registration_code', 'like', '%' . $search . '%');
                });
            }
        });
        if ($sort == 0) {
            $query->orderBy('name','asc');
        }elseif ($sort == 1) {
            $query->orderBy('created_at','desc');
        }elseif ($sort == 2) {
            $query->orderBy('created_at','asc');
        }elseif ($sort == 3) {
            $query->orderBy('name','asc');
        }elseif ($sort == 4) {
            $query->orderBy('name','desc');
        }
        $query = $query->paginate(perPage: $size, page: $page);
        return new CompanyCollection($query);
    }

    public function all(Request $request): CompanyCollection
    {
        $sort      = $request->input('sortBy', 0);
        $status    = $request->input('status', 1);

        $query = Company::query()->where('status', $status);
        $sortOptions = [
            0 => ['name', 'asc'],
            1 => ['created_at', 'desc'],
            2 => ['created_at', 'asc'],
            3 => ['name', 'asc'],
            4 => ['name', 'desc'],
        ];

        if (isset($sortOptions[$sort])) {
            [$column, $direction] = $sortOptions[$sort];
            $query->orderBy($column, $direction);
        }

        $query = $query->get();
        return new CompanyCollection($query);
    }

    public function get(int $id): CompanyResource
    {
        $query = Company::where('id', $id)->first();
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => [
                    "message" => [
                        "not found"
                    ]
                ]
            ])->setStatusCode(404));
        }
        return new CompanyResource($query);
    }

    public function update(int $id, CompanyUpdateRequest $request): CompanyResource
    {
        $query = Company::where('id', $id)->first();
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => [
                    "message" => [
                        "not found"
                    ]
                ]
            ])->setStatusCode(404));
        }

        $data = array_filter($request->validated(), function ($value) {
            return $value !== null;
        });
        try {
            DB::beginTransaction();
            if (isset($data['referral_code'])) {
                $query->referral_code = $data['referral_code'];
            }
            if (isset($data['registration_code'])) {
                $query->registration_code = $data['registration_code'];
            }
            if (isset($data['show_web'])) {
                $query->show_web = $data['show_web'];
            }
            if (isset($data['outlet'])) {
                $query->outlet = $data['outlet'];
            }
            if (isset($data['date_payment_next'])) {
                $query->date_payment_next = $data['date_payment_next'];
            }
            if (isset($data['payment_type'])) {
                $query->payment_type = $data['payment_type'];
            }
            if (isset($data['payment_value'])) {
                $query->payment_value = $data['payment_value'];
            }
            if (isset($data['api_key'])) {
                $query->api_key = $data['api_key'];
            }
            $query->save();
            DB::commit();
            return new CompanyResource($query);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function status(int $id, CompanyUpdateStatusRequest $request): CompanyResource
    {
        $query = Company::where('id', $id)->first();
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => [
                    "message" => [
                        "not found"
                    ]
                ]
            ])->setStatusCode(404));
        }

        $data = array_filter($request->validated(), function ($value) {
            return $value !== null;
        });
        try {
            DB::beginTransaction();
            if (isset($data['status'])) {
                $query->status = $data['status'];
            }
            $query->save();
            DB::commit();
            return new CompanyResource($query);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function export(Request $request)
    {
        $data = Company::query();
        $data->orderBy('name','asc');
        $data = $data->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header
        $headers = [
            'No', 'Refferal','Registration','Kode','Nama', 'Email', 'No HP', 'Alamat', 'Timezone','Tampil Web','Tanggal Pembayaran Selanjutnya', 'Tipe Berlangganan', 'Biaya Berlangganan','API Key','Status'
        ];

        // Tulis Header ke Sheet
        $column = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($column . '1', $header);
            $column++;
        }

        $row = 2;
        
        foreach ($data as $index => $item) {

            $sheet->setCellValue('A' . $row, $index + 1); 
            $sheet->setCellValue('B' . $row, $item->referral_code);
            $sheet->setCellValue('C' . $row, $item->registration_code);
            $sheet->setCellValue('D' . $row, $item->code);
            $sheet->setCellValue('E' . $row, $item->name);
            $sheet->setCellValue('F' . $row, $item->email);
            $sheet->setCellValue('G' . $row, $item->phone);
            $sheet->setCellValue('H' . $row, $item->address);
            $sheet->setCellValue('I' . $row, $item->timezone);
            $sheet->setCellValue('J' . $row, $item->show_web?'Ya':'Tidak');
            $sheet->setCellValue('K' . $row, $item->date_payment_next);
            $sheet->setCellValue('L' . $row, $item->payment_type);
            $sheet->setCellValue('M' . $row, $item->payment_value);
            $sheet->setCellValue('N' . $row, $item->api_key);
            $sheet->setCellValue('O' . $row, $item->status==1 ? 'Aktif':'Tidak Aktif');
            $sheet->getStyle('M' . $row)->getNumberFormat()->setFormatCode('#,##0');
            $row++;
        }

        $timestamp = now()->timestamp;
        $fileName  = "Perusahaan";
        $filename = 'Export Data ' . ucfirst($fileName) . ' ' . $timestamp . '.xlsx';

        $writer = new Xlsx($spreadsheet);
        $response = new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        });

        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment;filename="' . $filename . '"');
        $response->headers->set('Pragma', 'attachment;filename="'.$filename.'"');
        $response->headers->set('Cache-Control', 'max-age=0');

        return $response;
    }
}