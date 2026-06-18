<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerCreateRequest;
use App\Http\Requests\CustomerUpdateRequest;
use App\Http\Resources\CustomerCollection;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use DB;

class CustomerController extends Controller
{
    /**
     * Search & Paginate Customers for current Company
     */
    public function search(Request $request): CustomerCollection
    {
        $page      = $request->input('page', 1);
        $size      = $request->input('size', 10);
        $sort      = $request->input('sortBy', 0);
        $companyId = Auth::user()->company_id; 
        
        $query = Customer::query()->with('company');
        
        // Filter berdasarkan Company ID User yang login
        $query->where('company_id', $companyId);

        // Filter Pencarian
        $query->where(function (Builder $builder) use ($request) {
            $search = $request->input('search');
            if ($search) {
                $builder->where(function (Builder $builder) use ($search) {
                    $builder->orWhere('name', 'like', '%' . $search . '%');
                    $builder->orWhere('phone', 'like', '%' . $search . '%'); 
                });
            }
        });
        
        // Sorting logic
        if (in_array($sort, [0, 1])) {
            $query->orderBy('created_at', 'desc');
        } elseif ($sort == 2) {
            $query->orderBy('created_at', 'asc');
        } elseif ($sort == 3) {
            $query->orderBy('name', 'asc');
        } elseif ($sort == 4) {
            $query->orderBy('name', 'desc');
        }
        
        $users = $query->paginate(perPage: $size, page: $page);
        return new CustomerCollection($users);
    }

    /**
     * Create Customer - Company ID otomatis dari User login
     */
    public function create(CustomerCreateRequest $request): JsonResponse
    {
        $data = $request->validated();
        $companyId = Auth::user()->company_id; // Ambil ID Company sendiri

        try {
            DB::beginTransaction();
            $query = new Customer();
            $query->company_id = $companyId; // Paksa simpan ke company sendiri
            $query->name       = $data['name'];
            $query->phone      = $data['phone'];
            $query->address    = $data['address'] ?? null;
            $query->save();
            
            $query->load('company');
            DB::commit();
            return (new CustomerResource($query))->response()->setStatusCode(201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update Customer - Hanya bisa update jika milik Company sendiri
     */
    public function update(int $id, CustomerUpdateRequest $request) : CustomerResource|JsonResponse
    {
        $companyId = Auth::user()->company_id; 
        
        // Cari customer berdasarkan ID DAN Company ID
        $query = Customer::where('id', $id)->where('company_id', $companyId)->first();
        
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => ["message" => ["Data tidak ditemukan atau Anda tidak memiliki akses."]]
            ])->setStatusCode(404));
        }

        $data = $request->validated(); // Jangan gunakan array_filter jika ingin bisa mengosongkan field
        
        try {
            DB::beginTransaction();
            
            // Update data yang diperbolehkan
            $query->name    = $data['name'] ?? $query->name;
            $query->phone   = $data['phone'] ?? $query->phone;
            $query->address = $data['address'] ?? $query->address;
            
            $query->save();
            $query->load('company');
            
            DB::commit();
            return new CustomerResource($query);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sisanya (Get, Delete, Export) tetap pakai pengaman Company ID
     */
    public function get(int $id): CustomerResource
    {
        $companyId = Auth::user()->company_id; 
        $query = Customer::where('id', $id)->where('company_id', $companyId)->first();

        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => ["message" => ["not found"]]
            ])->setStatusCode(404));
        }
        $query->load('company');
        return new CustomerResource($query);
    }

    public function delete(int $id): JsonResponse
    {
        $companyId = Auth::user()->company_id;
        $query = Customer::where('id', $id)->where('company_id', $companyId)->first();
        
        if (!$query) {
            return response()->json(['errors' => ["message" => ["not found"]]], 404);
        }
        
        $query->delete();
        return response()->json(['data' => true], 200);
    }
}