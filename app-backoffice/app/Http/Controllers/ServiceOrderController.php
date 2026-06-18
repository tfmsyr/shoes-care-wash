<?php

namespace App\Http\Controllers;

use App\Models\ServiceOrder;
use App\Models\ServiceOrderDetail;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ServiceOrderController extends Controller
{
    /**
     * LIST ORDER
     */
    public function index(): JsonResponse
    {
        $orders = ServiceOrder::with(['customer', 'details.service'])
            ->where('company_id', Auth::user()->company_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $orders]);
    }

    /**
     * SIMPAN ORDER BARU
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id' => 'required',
            'items'       => 'required|array|min:1',
            'items.*.service_id' => 'required',
            'items.*.qty'        => 'required|integer',
            'items.*.price'      => 'required|numeric',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $user = Auth::user();

                $order = ServiceOrder::create([
                    'order_number' => $this->generateOrderNumber($user->company_id),
                    'company_id'   => $user->company_id,
                    'customer_id'  => $request->customer_id,
                    'discount'     => $request->discount ?? 0,
                    'status'       => $request->status ?? 'received',
                    'notes'        => $request->notes,
                    'service_id'   => null, 
                ]);

                foreach ($request->items as $item) {
                    ServiceOrderDetail::create([
                        'service_order_id' => $order->id,
                        'service_id'       => $item['service_id'],
                        'quantity'         => $item['qty'],
                        'price'            => $item['price'],
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Order berhasil dibuat!',
                    'data'    => $order->load('customer', 'details.service')
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * AMBIL DETAIL ORDER (Untuk Form Edit)
     */
    public function show($id): JsonResponse
    {
        try {
            // Mengambil order berdasarkan ID dan company_id user yang sedang login
            $order = ServiceOrder::with(['customer', 'details.service'])
                ->where('company_id', Auth::user()->company_id)
                ->find($id);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * UPDATE ORDER
     */
    public function update(Request $request, $id): JsonResponse
    {
        $items = $request->input('services', $request->input('items', []));

        // Validasi payload dari Next.js
        $request->validate([
            'customer_id' => 'required',
            'status'      => 'required',
            'services'    => 'nullable|array|min:1',
            'items'       => 'nullable|array|min:1',
        ]);

        if (empty($items)) {
            return response()->json([
                'message' => 'Minimal harus ada 1 layanan.'
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request, $id, $items) {
                $user = Auth::user();
                $order = ServiceOrder::where('company_id', $user->company_id)->find($id);

                if (!$order) {
                    return response()->json(['message' => 'Order tidak ditemukan'], 404);
                }

                // 1. Update Tabel Utama (ServiceOrder)
                $order->update([
                    'customer_id' => $request->customer_id,
                    'discount'    => $request->discount ?? 0,
                    'status'      => $request->status,
                    'notes'       => $request->notes,
                ]);

                // 2. Update Tabel Detail (ServiceOrderDetail)
                // Hapus detail lama, masukkan yang baru (cara paling bersih)
                ServiceOrderDetail::where('service_order_id', $order->id)->delete();

                foreach ($items as $svc) {
                    ServiceOrderDetail::create([
                        'service_order_id' => $order->id,
                        'service_id'       => $svc['service_id'],
                        'quantity'         => $svc['quantity'] ?? $svc['qty'] ?? 1,
                        'price'            => $svc['price'] ?? 0, 
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Order berhasil diperbarui!',
                    'data'    => $order->load('details.service')
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * HAPUS ORDER
     */
    public function destroy($id): JsonResponse
    {
        try {
            $order = ServiceOrder::where('company_id', Auth::user()->company_id)->find($id);
            
            if (!$order) {
                return response()->json(['message' => 'Order tidak ditemukan'], 404);
            }

            $order->delete(); // Detail biasanya terhapus otomatis jika ada cascade on delete di DB

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus order: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateOrderNumber(int $companyId): string
    {
        $date = Carbon::now()->format('Ymd');
        $prefix = "SO-{$date}-";

        $lastOrder = ServiceOrder::where('company_id', $companyId)
            ->where('order_number', 'like', $prefix . '%')
            ->lockForUpdate()
            ->orderByDesc('id')
            ->first();

        $lastSequence = 0;

        if ($lastOrder?->order_number) {
            $lastSequence = (int) substr($lastOrder->order_number, -4);
        }

        return $prefix . str_pad((string) ($lastSequence + 1), 4, '0', STR_PAD_LEFT);
    }
}
