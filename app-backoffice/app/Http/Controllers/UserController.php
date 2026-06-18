<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserCreateRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Hash;
use DB;
class UserController extends Controller
{
    public function search(Request $request): UserCollection
    {
        $page     = $request->input('page', 1);
        $size     = $request->input('size', 10);
        $sort     = $request->input('sortBy',0);
        $companyId= $request->input('company_id',0);
        $query    = User::query()->with('company','role');
        $query = $query->where(function (Builder $builder) use ($request) {
            $search = $request->input('search');
            if ($search) {
                $builder->where(function (Builder $builder) use ($search) {
                    $builder->orWhere('name', 'like', '%' . $search . '%');
                    $builder->orWhere('email', 'like', '%' . $search . '%');
                });
            }
        });
        $query->where('role_id', 4);
        $query->where('company_id', $companyId);
        if ($sort == 0) {
            $query->orderBy('created_at','desc');
        }elseif ($sort == 1) {
            $query->orderBy('created_at','desc');
        }elseif ($sort == 2) {
            $query->orderBy('created_at','asc');
        }elseif ($sort == 3) {
            $query->orderBy('name','asc');
        }elseif ($sort == 4) {
            $query->orderBy('name','desc');
        }
        $users = $query->paginate(perPage: $size, page: $page);
        return new UserCollection($users);
    }

    public function all(Request $request): UserCollection
    {
        $companyId = $request->input('company_id',0);
        $query = User::query()->with('company','role');
        $query->where('company_id', $companyId);
        $query->where('status', 1);
        $query->where('role_id', 4);
        $query= $query->get();
        return new UserCollection($query);
    }

    public function create(UserCreateRequest $request): JsonResponse
    {
        $data = $request->validated();
        try {
            DB::beginTransaction();
            $query = new User();
            $query->company_id           = $data['company_id'];
            $query->nik                  = $data['nik'];
            $query->name                 = $data['name'];
            $query->phone                = $data['phone'];
            $query->email                = $data['email'];
            $query->role_id              = 4;
            $query->status               = 1;
            $query->password             = Hash::make($data['password']);
            if ($request->hasFile('photo')) {
                $url          = $this->uploadToS3($request->file('photo'), 'users');
                $query->photo = $url;
            }else{
                $query->photo = 'https://is3.cloudhost.id/vras/shoescare/users/no_img.png';
            }
            $query->save();
            $query->load('company','role');
            DB::commit();
            return (new UserResource($query))->response()->setStatusCode(201);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function get(int $id): UserResource
    {
        $query = User::where('id', $id)->first();
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => [
                    "message" => [
                        "not found"
                    ]
                ]
            ])->setStatusCode(404));
        }
        $query->load('company','role');
        return new UserResource($query);
    }

    public function update(int $id, UserUpdateRequest $request): UserResource|JsonResponse
    {
        $query = User::where('id', $id)->first();
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => [
                    "message" => [
                        "not found"
                    ]
                ]
            ])->setStatusCode(404));
        }

        $data = array_filter($request->validated());
        try {
            DB::beginTransaction();
            
            if (isset($data['nik'])) {
                $query->nik = $data['nik'];
            }
            if (isset($data['name'])) {
                $query->name = $data['name'];
            }
            if (isset($data['email'])) {
                $query->email = $data['email'];
            }
            if (isset($data['phone'])) {
                $query->phone = $data['phone'];
            }
            if (isset($data['password'])) {
                $query->password = Hash::make($data['password']);
            }
            if ($request->hasFile('photo')) {
                $folder      = "users";
                if ($query->photo && $query->photo !='https://is3.cloudhost.id/vras/shoescare/users/no_img.png') {
                    $this->deleteFromS3($query->photo);
                }
                $url         = $this->uploadToS3($request->file('photo'), $folder);
                $query->photo = $url;
            }
            $query->save();
            $query->load('company','role');
            DB::commit();
            return new UserResource($query);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function delete(int $id): JsonResponse
    {
        $query = User::where('id', $id)->first();
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => [
                    "message" => [
                        "not found"
                    ]
                ]
            ])->setStatusCode(404));
        }
        $query->delete();
        return response()->json([
            'data' => true
        ])->setStatusCode(200);
    }

    public function deleteMultiple(Request $request): JsonResponse
    {
        $ids = $request->input('ids');
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid or empty IDs provided.',
            ], 400);
        }
        User::whereIn('id', $ids)->delete();
        return response()->json([
            'data' => true
        ])->setStatusCode(200);
    }

    public function export(Request $request)
    {
        $companyId = $request->input('company_id',0);
        $data = User::query();
        $data->where('role_id', 4);
        $data->where('company_id', $companyId);
        $data = $data->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header
        $headers = [
            'No','NIK', 'Nama', 'No HP', 'Email', 'Status'
        ];

        // Tulis Header ke Sheet
        $column = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($column . '1', $header);
            $column++;
        }


        $row = 2;
        foreach ($data as $index => $item) {
            $sheet->setCellValue('A' . $row, $index + 1); // No
            $sheet->setCellValue('B' . $row, $item->nik);
            $sheet->setCellValue('C' . $row, $item->name);
            $sheet->setCellValue('D' . $row, $item->phone ?? '-');
            $sheet->setCellValue('E' . $row, $item->email ?? '-');
            $sheet->setCellValue('F' . $row, $item->status==1 ? 'Aktif':'Tidak Aktif');
            $row++;
        }

        $timestamp = now()->timestamp;
        $fileName  = "Karyawan";
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
