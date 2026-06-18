<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductCreateRequest;
use App\Http\Requests\ProductUpdateRequest;
use App\Http\Resources\ProductCollection;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Hash;
use DB;

class ProductController extends Controller
{
    public function search(Request $request): ProductCollection
    {
        $page     = $request->input('page', 1);
        $size     = $request->input('size', 10);
        $sort     = $request->input('sortBy',0);
        $status   = $request->input('status', 'all');
        
        // AMAN: Ambil company_id langsung dari user yang login
        $companyId = Auth::user()->company_id; 

        $query    = Product::query()->with('category','company');

        $query = $query->where(function (Builder $builder) use ($request) {
            $search = $request->input('search');
            if ($search) {
                $builder->where(function (Builder $builder) use ($search) {
                    $builder->orWhere('code', 'like', '%' . $search . '%');
                    $builder->orWhere('name', 'like', '%' . $search . '%');
                });
            }
        });
        
        // Filter wajib: Hanya produk milik perusahaannya
        $query->where('company_id', $companyId);

        if($status != 'all'){
            $query->where('status', $status);
        }
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

        return new ProductCollection($query);
    }

    public function all(Request $request): ProductCollection
    {
        // AMAN: Ambil company_id langsung dari user yang login
        $companyId = Auth::user()->company_id;

        $query = Product::query()->with('category','company');
        $query->where('company_id', $companyId);
        $query= $query->get();
        return new ProductCollection($query);
    }

    public function create(ProductCreateRequest $request): JsonResponse
    {
        $data = $request->validated();
        try {
            DB::beginTransaction();
            $query = new Product();
            
            // AMAN: Set company_id otomatis dari user, jangan dari input
            $query->company_id           = Auth::user()->company_id; 
            
            $query->code                 = $data['code'];
            $query->name                 = $data['name'];
            $query->barcode              = $data['barcode'];
            $query->category_id          = $data['category_id'];
            $query->unit                 = $data['unit'];
            $query->purchase_price       = $data['purchase_price'];
            $query->selling_price        = $data['selling_price'];
            $query->discount             = $data['discount'];
            $query->description          = $data['description'];
            $query->stock                = $data['stock'];
            $query->status               = 1;
            
            if ($request->hasFile('photo')) {
                $url           = $this->uploadToS3($request->file('photo'), 'products');
                $query->photo = $url;
            }else{
                $query->photo = 'https://is3.cloudhost.id/vras/shoescare/products/no_img.png';
            }
            
            $query->save();
            DB::commit();
            $query->load('category','company');
            return (new ProductResource($query))->response()->setStatusCode(201);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function get(int $id): ProductResource
    {
        // AMAN: Pastikan produk yang dipanggil milik perusahaannya
        $query = Product::where('id', $id)
                        ->where('company_id', Auth::user()->company_id)
                        ->with('category','company')
                        ->first();
                        
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => ["message" => ["not found"]]
            ])->setStatusCode(404));
        }

        return new ProductResource($query);
    }

    public function update(int $id, ProductUpdateRequest $request): ProductResource|JsonResponse
    {
        // AMAN: Pastikan produk yang diedit milik perusahaannya
        $query = Product::where('id', $id)
                        ->where('company_id', Auth::user()->company_id)
                        ->first();
                        
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => ["message" => ["not found"]]
            ])->setStatusCode(404));
        }

        $data = array_filter($request->validated());
        try {
            DB::beginTransaction();

            if (isset($data['code'])) $query->code = $data['code'];
            if (isset($data['name'])) $query->name = $data['name'];
            if (isset($data['barcode'])) $query->barcode = $data['barcode'];
            if (isset($data['category_id'])) $query->category_id = $data['category_id'];
            if (isset($data['unit'])) $query->unit = $data['unit'];
            if (isset($data['purchase_price'])) $query->purchase_price = $data['purchase_price'];
            if (isset($data['selling_price'])) $query->selling_price = $data['selling_price'];
            if (isset($data['discount'])) $query->discount = $data['discount'];
            if (isset($data['description'])) $query->description = $data['description'];
            if (isset($data['stock'])) $query->stock = $data['stock'];
            
            if ($request->hasFile('photo')) {
                if ($query->photo && $query->photo != 'https://is3.cloudhost.id/vras/shoescare/products/no_img.png') {
                    $this->deleteFromS3($query->photo);
                }
                $url = $this->uploadToS3($request->file('photo'), 'products');
                $query->photo = $url;
            }
            $query->save();
            $query->load('category','company');
            DB::commit();
            return new ProductResource($query);
        }catch (\Exception $e) {
            DB::rollBack();
            throw new HttpResponseException(response()->json([
                'message' => 'Update failed',
                'error'   => $e->getMessage(),
            ], 500));
        }
    }

    public function delete(int $id): JsonResponse
    {
        // AMAN: Pastikan produk yang dihapus milik perusahaannya
        $query = Product::where('id', $id)
                        ->where('company_id', Auth::user()->company_id)
                        ->first();
                        
        if (!$query) {
            throw new HttpResponseException(response()->json([
                'errors' => ["message" => ["not found"]]
            ])->setStatusCode(404));
        }
        
        if ($query->photo && $query->photo != 'https://is3.cloudhost.id/vras/shoescare/products/no_img.png') {
            $this->deleteFromS3($query->photo);
        }
        $query->delete();
        return response()->json(['data' => true])->setStatusCode(200);
    }

    public function export(Request $request)
    {
        // AMAN: Ekspor hanya data milik perusahaannya
        $data = Product::query()
                       ->where('company_id', Auth::user()->company_id)
                       ->with('category')
                       ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['No', 'Kode', 'Nama', 'Barcode', 'Kategori', 'Satuan', 'Harga Beli (Rp)','Harga Jual (Rp)','Diskon','Keterangan','Total Stok'];

        $column = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($column . '1', $header);
            $column++;
        }

        $row = 2;
        foreach ($data as $index => $item) {
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $item->code);
            $sheet->setCellValue('C' . $row, $item->name);
            $sheet->setCellValue('D' . $row, $item->barcode);
            $sheet->setCellValue('E' . $row, $item->category?$item->category->name:'-');
            $sheet->setCellValue('F' . $row, $item->unit);
            $sheet->setCellValue('G' . $row, $item->purchase_price);
            $sheet->setCellValue('H' . $row, $item->selling_price);
            $sheet->setCellValue('I' . $row, $item->discount);
            $sheet->setCellValue('J' . $row, $item->description);
            $sheet->setCellValue('K' . $row, $item->stock);
            
            $sheet->getStyle('G' . $row)->getNumberFormat()->setFormatCode('#,##0');
            $sheet->getStyle('H' . $row)->getNumberFormat()->setFormatCode('#,##0');
            $sheet->getStyle('K' . $row)->getNumberFormat()->setFormatCode('#,##0');
            $row++;
        }

        $timestamp = now()->timestamp;
        $fileName  = "Product";
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