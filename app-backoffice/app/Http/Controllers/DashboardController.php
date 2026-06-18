<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductOrder;
use App\Models\ServiceOrder;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function getDashboardData(Request $request): JsonResponse
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $period = $request->get('period', 'today');

        [$periodStart, $periodEnd] = $this->resolvePeriodRange($period);

        $serviceOrders = ServiceOrder::with(['customer', 'details.service'])
            ->where('company_id', $companyId)
            ->get();

        $productOrders = ProductOrder::with(['items.product'])
            ->where('company_id', $companyId)
            ->get();

        $serviceRevenueTotal = $serviceOrders
            ->whereNotIn('status', ['cancelled'])
            ->sum(function ($order) {
                $subtotal = $order->details->sum(function ($detail) {
                    return ((float) $detail->price) * ((int) $detail->quantity);
                });

                $discountPercent = (float) ($order->discount ?? 0);
                $discountAmount = $subtotal * ($discountPercent / 100);

                return $subtotal - $discountAmount;
            });

        $productRevenueTotal = $productOrders
            ->whereNotIn('status', ['cancelled'])
            ->sum(function ($order) {
                return (float) ($order->total_amount ?? 0);
            });

        $todayStart = Carbon::today();
        $todayEnd = Carbon::today()->endOfDay();

        $todayRevenue = $this->calculateServiceRevenueForRange($serviceOrders, $todayStart, $todayEnd)
            + $this->calculateProductRevenueForRange($productOrders, $todayStart, $todayEnd);

        $periodTotal = $this->calculateServiceRevenueForRange($serviceOrders, $periodStart, $periodEnd)
            + $this->calculateProductRevenueForRange($productOrders, $periodStart, $periodEnd);

        $activeServiceOrders = $serviceOrders->whereIn('status', ['received', 'in_progress']);
        $activeProductOrders = $productOrders->whereIn('status', ['received', 'processing']);
        $activeOrders = $activeServiceOrders->count() + $activeProductOrders->count();

        $newOrders = $serviceOrders
            ->filter(fn ($order) => $order->created_at && $order->created_at->between($todayStart, $todayEnd))
            ->count()
            + $productOrders
                ->filter(fn ($order) => $order->created_at && $order->created_at->between($todayStart, $todayEnd))
                ->count();

        $lowStock = Product::query()
            ->where('company_id', $companyId)
            ->where('stock', '<=', 5)
            ->count();

        $recentServices = ServiceOrder::with(['customer', 'details.service'])
            ->where('company_id', $companyId)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer_name' => $order->customer?->name ?? 'Tanpa Nama',
                    'items_summary' => $order->details->pluck('service.name')->filter()->join(', '),
                    'status' => $order->status,
                ];
            })
            ->values();

        $recentProducts = ProductOrder::with(['items.product'])
            ->where('company_id', $companyId)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer_name' => $order->customer_name ?? 'Tanpa Nama',
                    'items_summary' => $order->items->pluck('product.name')->filter()->join(', '),
                    'status' => $order->status,
                ];
            })
            ->values();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'stats' => [
                'revenue' => round($todayRevenue),
                'active_orders' => $activeOrders,
                'new_orders' => $newOrders,
                'low_stock' => $lowStock,
            ],
            'revenue_total' => round($serviceRevenueTotal + $productRevenueTotal),
            'period_total' => round($periodTotal),
            'breakdown' => [
                'services' => round($serviceRevenueTotal),
                'products' => round($productRevenueTotal),
            ],
            'recent_services' => $recentServices,
            'recent_products' => $recentProducts,
        ], 200);
    }

    private function resolvePeriodRange(string $period): array
    {
        return match ($period) {
            'week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            default => [Carbon::today(), Carbon::today()->endOfDay()],
        };
    }

    private function calculateServiceRevenueForRange($serviceOrders, Carbon $start, Carbon $end): float
    {
        return (float) $serviceOrders
            ->whereNotIn('status', ['cancelled'])
            ->filter(fn ($order) => $order->created_at && $order->created_at->between($start, $end))
            ->sum(function ($order) {
                $subtotal = $order->details->sum(function ($detail) {
                    return ((float) $detail->price) * ((int) $detail->quantity);
                });

                $discountPercent = (float) ($order->discount ?? 0);
                $discountAmount = $subtotal * ($discountPercent / 100);

                return $subtotal - $discountAmount;
            });
    }

    private function calculateProductRevenueForRange($productOrders, Carbon $start, Carbon $end): float
    {
        return (float) $productOrders
            ->whereNotIn('status', ['cancelled'])
            ->filter(fn ($order) => $order->created_at && $order->created_at->between($start, $end))
            ->sum(function ($order) {
                return (float) ($order->total_amount ?? 0);
            });
    }
}
