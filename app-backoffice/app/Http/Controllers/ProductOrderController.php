<?php

namespace App\Http\Controllers;

use App\Models\ProductOrder;
use App\Models\Product;
use App\Http\Requests\ProductOrderRequest;
use App\Http\Resources\ProductOrderResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductOrderController extends Controller
{
    /**
     * Menampilkan daftar order dengan pagination & pencarian
     */
    public function search(Request $request)
    {
        try {
            $query = ProductOrder::with(['items.product'])
                ->where('company_id', Auth::user()->company_id);

            if ($request->has('search') && $request->search != '') {
                $query->where(function ($subQuery) use ($request) {
                    $subQuery->where('order_number', 'like', '%' . $request->search . '%')
                        ->orWhere('customer_name', 'like', '%' . $request->search . '%');
                });
            }

            $orders = $query->latest()->paginate($request->get('per_page', 10));
            
            return ProductOrderResource::collection($orders);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil data: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Menampilkan semua data tanpa pagination
     */
    public function all()
    {
        $orders = ProductOrder::with(['items.product'])
            ->where('company_id', Auth::user()->company_id)
            ->get();
        return ProductOrderResource::collection($orders);
    }

    /**
     * Membuat Order Baru (Full Logic dengan Detail Items)
     */
    public function create(ProductOrderRequest $request)
    {
        try {
            DB::beginTransaction();
            $user = Auth::user();

            // 1. Validasi sudah dilakukan otomatis oleh ProductOrderRequest
            $validatedData = $request->validated();

            // 2. Simpan Header Order
            $order = ProductOrder::create([
                ...collect($validatedData)->except('items')->all(),
                'company_id' => $user->company_id,
            ]);

            // 3. Simpan Detail Items (Jika ada array items yang dikirim)
            if ($request->has('items') && is_array($request->items)) {
                foreach ($request->items as $item) {
                    $product = Product::findOrFail($item['product_id']);
                    $price = $item['price'] ?? $product->selling_price ?? 0;

                    // Jika kamu menggunakan tabel pivot (belongsToMany)
                    // $order->products()->attach($item['product_id'], [
                    //     'quantity' => $item['qty'],
                    //     'price' => $item['price'],
                    // ]);

                    // ATAU Jika kamu menggunakan Model ProductOrderItem (hasMany)
                    $order->items()->create([
                        'product_id' => $item['product_id'],
                        'qty'        => $item['qty'],
                        'price'      => $price,
                        'subtotal'   => ($item['qty'] * $price)
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Order produk berhasil dibuat',
                'data' => new ProductOrderResource($order->load(['items.product']))
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menampilkan Detail Satu Order
     */
    public function get($id)
    {
        $order = ProductOrder::with(['items.product'])
            ->where('company_id', Auth::user()->company_id)
            ->find($id);
        
        if (!$order) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return new ProductOrderResource($order);
    }

    /**
     * Update Data Order
     */
    public function update(ProductOrderRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $order = ProductOrder::where('company_id', Auth::user()->company_id)->findOrFail($id);
            $validatedData = $request->validated();
            $order->update(collect($validatedData)->except('items')->all());

            // Jika items perlu diupdate juga, biasanya hapus yang lama lalu insert baru
            if ($request->has('items')) {
                $order->items()->delete(); // Hapus detail lama
                foreach ($request->items as $item) {
                    $product = Product::findOrFail($item['product_id']);
                    $price = $item['price'] ?? $product->selling_price ?? 0;

                    $order->items()->create([
                        'product_id' => $item['product_id'],
                        'qty'        => $item['qty'],
                        'price'      => $price,
                        'subtotal'   => ($item['qty'] * $price)
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Order berhasil diperbarui',
                'data' => new ProductOrderResource($order->load('items'))
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal update: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Menghapus Data Order
     */
    public function delete($id)
    {
        try {
            $order = ProductOrder::where('company_id', Auth::user()->company_id)->findOrFail($id);
            
            // Hapus detailnya dulu jika ada relasi
            $order->items()->delete();
            $order->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Order berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus: ' . $e->getMessage()], 500);
        }
    }
}
