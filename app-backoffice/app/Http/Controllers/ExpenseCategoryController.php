<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseCategoryCreateRequest;
use App\Http\Requests\ExpenseCategoryUpdateRequest;
use App\Http\Resources\ExpenseCategoryCollection;
use App\Http\Resources\ExpenseCategoryResource;
use App\Models\ExpenseCategory;
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
class ExpenseCategoryController extends Controller
{
    public function search(Request $request): ExpenseCategoryCollection
    {
        $page     = $request->input('page', 1);
        $size     = $request->input('size', 10);
        $sort     = $request->input('sortBy',0);
        $companyId= $request->input('company_id',0);
        $query    = ExpenseCategory::query()->with('company');

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

        return new ExpenseCategoryCollection($query);
    }

    public function all(Request $request): ExpenseCategoryCollection
    {
        $companyId = $request->input('company_id',0);
        $query = ExpenseCategory::query()->with('company');
        $query->where('company_id', $companyId);
        $query= $query->get();
        return new ExpenseCategoryCollection($query);
    }

    public function create(ExpenseCategoryCreateRequest $request): JsonResponse
    {
        $data = $request->validated();
        try {
            DB::beginTransaction();
            $query = new ExpenseCategory();
            $query->company_id           = $data['company_id'];
            $query->name                 = $data['name'];
            $query->description          = $data['description'];
            $query->save();
            $query->load('company');
            DB::commit();
            return (new ExpenseCategoryResource($query))->response()->setStatusCode(201);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function get(int $id): ExpenseCategoryResource
    {
        $query = ExpenseCategory::where('id', $id)->with('company','expenses')->first();
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => [
                    "message" => [
                        "not found"
                    ]
                ]
            ])->setStatusCode(404));
        }

        return new ExpenseCategoryResource($query);
    }

    public function update(int $id, ExpenseCategoryUpdateRequest $request): ExpenseCategoryResource|JsonResponse
    {
        $query = ExpenseCategory::where('id', $id)->with('company')->first();
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
            return new ExpenseCategoryResource($query);
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
        $query = ExpenseCategory::where('id', $id)->first();
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
        ExpenseCategory::whereIn('id', $ids)->delete();
        return response()->json([
            'data' => true
        ])->setStatusCode(200);
    }

}
