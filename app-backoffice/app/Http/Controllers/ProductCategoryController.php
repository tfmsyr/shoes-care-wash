<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductCategoryCreateRequest;
use App\Http\Requests\ProductCategoryUpdateRequest;
use App\Http\Resources\ProductCategoryCollection;
use App\Http\Resources\ProductCategoryResource;
use App\Models\ProductCategory;
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

class ProductCategoryController extends Controller
{
    public function search(Request $request): ProductCategoryCollection
    {
        $page     = $request->input('page', 1);
        $size     = $request->input('size', 10);
        $sort     = $request->input('sortBy',0);
        $companyId = Auth::user()->company_id;
        
        // REVISI: Menghapus with('company')
        $query    = ProductCategory::query(); 

        $query = $query->where(function (Builder $builder) use ($request) {
            $search = $request->input('search');
            if ($search) {
                $builder->where(function (Builder $builder) use ($search) {
                    $builder->orWhere('name', 'like', '%' . $search . '%');
                });
            }
        });
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
        $query = $query->paginate(perPage: $size, page: $page);

        return new ProductCategoryCollection($query);
    }

    public function all(Request $request): ProductCategoryCollection
    {
        // REVISI: Menggunakan Auth untuk mengambil company_id
        $companyId = Auth::user()->company_id; 
        
        // REVISI: Menghapus with('company')
        $query = ProductCategory::query(); 
        
        $query->where('company_id', $companyId);
        $query= $query->get();
        return new ProductCategoryCollection($query);
    }

    public function create(ProductCategoryCreateRequest $request): JsonResponse
    {
        $data = $request->validated();
        try {
            DB::beginTransaction();
            $query = new ProductCategory();
            $query->company_id = Auth::user()->company_id;
            $query->name                 = $data['name'];
            $query->description          = $data['description'];
            $query->save();
            
            // REVISI: Menghapus load('company')
            
            DB::commit();
            return (new ProductCategoryResource($query))->response()->setStatusCode(201);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function get(int $id): ProductCategoryResource
    {
        $query = ProductCategory::where('id', $id)->where('company_id', Auth::user()->company_id)->first();
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => [
                    "message" => [
                        "not found"
                    ]
                ]
            ])->setStatusCode(404));
        }

        return new ProductCategoryResource($query);
    }

    public function update(int $id, ProductCategoryUpdateRequest $request): ProductCategoryResource|JsonResponse
    {
        $query = ProductCategory::where('id', $id)->where('company_id', Auth::user()->company_id)->first();
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
            if (isset($data['name'])) {
                $query->name = $data['name'];
            }
            if (isset($data['description'])) {
                $query->description = $data['description'];
            }
            $query->save();
            DB::commit();
            return new ProductCategoryResource($query);
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
        // REVISI PENTING: Menambahkan where('id', $id) agar tidak menghapus data urutan pertama
        $query = ProductCategory::where('id', $id)->where('company_id', Auth::user()->company_id)->first();
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
        
        // REVISI PENTING: Memastikan ID yang dihapus HANYA milik user yang sedang login
        ProductCategory::whereIn('id', $ids)
            ->where('company_id', Auth::user()->company_id)
            ->delete();
            
        return response()->json([
            'data' => true
        ])->setStatusCode(200);
    }
}