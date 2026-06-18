<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\ProductOrder;
use App\Models\ServiceOrder;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = Auth::user()->company_id;
        $year = (int) $request->get('year', now()->year);
        $period = $request->get('period', 'year');

        if (! in_array($period, ['day', 'week', 'month', 'year'], true)) {
            $period = 'year';
        }

        $serviceOrders = ServiceOrder::with(['customer', 'details.service'])
            ->where('company_id', $companyId)
            ->get();

        $customers = Customer::query()
            ->where('company_id', $companyId)
            ->get();

        $productOrders = ProductOrder::with(['items.product'])
            ->where('company_id', $companyId)
            ->get();

        $expenses = Expense::query()
            ->where('company_id', $companyId)
            ->get();

        $serviceRevenueTotal = $serviceOrders
            ->whereNotIn('status', ['cancelled'])
            ->sum(fn ($order) => $this->serviceOrderTotal($order));

        $productRevenueTotal = $productOrders
            ->whereNotIn('status', ['cancelled'])
            ->sum(fn ($order) => (float) ($order->total_amount ?? 0));

        $totalIncome = $serviceRevenueTotal + $productRevenueTotal;
        $totalExpenses = (float) $expenses->sum('amount');
        $totalProductSales = (int) $productOrders->sum(fn ($order) => $order->items->sum('qty'));

        $incomeExpenseChart = collect($this->buildPeriodBuckets($period, $year))
            ->map(function ($bucket) use ($serviceOrders, $productOrders, $expenses) {
                $start = $bucket['start'];
                $end = $bucket['end'];

                $income =
                    $serviceOrders
                        ->filter(fn ($order) => $order->created_at && $order->created_at->between($start, $end))
                        ->whereNotIn('status', ['cancelled'])
                        ->sum(fn ($order) => $this->serviceOrderTotal($order)) +
                    $productOrders
                        ->filter(fn ($order) => $order->created_at && $order->created_at->between($start, $end))
                        ->whereNotIn('status', ['cancelled'])
                        ->sum(fn ($order) => (float) ($order->total_amount ?? 0));

                $expense = $expenses
                    ->filter(fn ($item) => $item->date && Carbon::parse($item->date)->between($start, $end))
                    ->sum('amount');

                return [
                    'name' => $bucket['label'],
                    'income' => round($income),
                    'expense' => round($expense),
                ];
            })
            ->values();

        $expenseBreakdownRaw = $expenses
            ->groupBy(fn ($expense) => $expense->category?->name ?? 'Uncategorized')
            ->map(function ($items, $name) use ($totalExpenses) {
                $amount = (float) $items->sum('amount');
                return [
                    'name' => $name,
                    'value' => $totalExpenses > 0 ? round(($amount / $totalExpenses) * 100) : 0,
                    'amount' => round($amount),
                ];
            })
            ->sortByDesc('amount')
            ->take(5)
            ->values();

        $expensePalette = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'];
        $expenseBreakdown = $expenseBreakdownRaw->values()->map(function ($item, $index) use ($expensePalette) {
            return [
                ...$item,
                'color' => $expensePalette[$index] ?? '#CBD5E1',
            ];
        })->values();

        $serviceCustomerOrderCounts = $serviceOrders
            ->filter(fn ($order) => !empty($order->customer_id))
            ->countBy('customer_id');

        $newCustomers = $customers->count();
        $returningCustomers = $serviceCustomerOrderCounts
            ->filter(fn ($count) => $count > 1)
            ->count();
        $allOrdersCount = $serviceOrders->count() + $productOrders->count();
        $avgOrder = $allOrdersCount > 0 ? round($totalIncome / $allOrdersCount) : 0;

        $topService = $serviceOrders
            ->flatMap(fn ($order) => $order->details)
            ->groupBy(fn ($detail) => $detail->service?->name ?? 'Unknown')
            ->map(fn ($items) => $items->sum('quantity'))
            ->sortDesc();

        $topProduct = $productOrders
            ->flatMap(fn ($order) => $order->items)
            ->groupBy(fn ($item) => $item->product?->name ?? 'Unknown')
            ->map(fn ($items) => $items->sum('qty'))
            ->sortDesc();

        $serviceStatusDistribution = collect([
            'Completed' => $serviceOrders->where('status', 'completed')->count(),
            'In Progress' => $serviceOrders->where('status', 'in_progress')->count(),
            'Received' => $serviceOrders->where('status', 'received')->count(),
            'Cancelled' => $serviceOrders->where('status', 'cancelled')->count(),
        ])->map(function ($value, $name) {
            $colors = [
                'Completed' => '#84CC16',
                'In Progress' => '#FB923C',
                'Received' => '#60A5FA',
                'Cancelled' => '#EF4444',
            ];

            return [
                'name' => $name,
                'value' => $value,
                'color' => $colors[$name],
            ];
        })->values();

        $currentWeekStart = now()->startOfWeek();
        $servicePerformance = collect(range(0, 6))->map(function ($index) use ($serviceOrders, $currentWeekStart) {
            $day = (clone $currentWeekStart)->addDays($index);
            $value = $serviceOrders
                ->filter(fn ($order) => $order->created_at && $order->created_at->isSameDay($day))
                ->whereNotIn('status', ['cancelled'])
                ->sum(fn ($order) => $this->serviceOrderTotal($order));

            return [
                'name' => strtoupper($day->format('D')),
                'value' => round($value),
            ];
        })->values();

        $highestServiceValue = $servicePerformance->max('value');
        $servicePerformance = $servicePerformance->map(function ($item) use ($highestServiceValue) {
            return [
                ...$item,
                'isHigh' => $highestServiceValue > 0 && $item['value'] === $highestServiceValue,
            ];
        })->values();

        $serviceOrderTrend = $topService->take(5)->map(function ($count, $type) {
            return [
                'type' => $type,
                'count' => "{$count} Orders",
            ];
        })->values();

        $productPerformance = $topProduct->take(5)->map(function ($count, $name) use ($topProduct) {
            return [
                'name' => $name,
                'value' => (int) $count,
                'highlight' => $count === $topProduct->max(),
            ];
        })->values();

        $bestSellingProducts = $topProduct->take(5)->map(function ($count, $name) {
            return [
                'name' => $name,
                'sales' => (int) $count,
            ];
        })->values();

        $lowPerformingProducts = $topProduct->sort()->take(5)->map(function ($count, $name) {
            return [
                'name' => $name,
                'sales' => (int) $count,
            ];
        })->values();

        $serviceRows = $serviceOrders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_id' => $order->order_number ?? "SO-{$order->id}",
                'customer' => $order->customer?->name ?? 'Tanpa Nama',
                'summary' => $order->details->pluck('service.name')->filter()->join(', '),
                'total' => round($this->serviceOrderTotal($order)),
                'status' => $order->status,
                'type' => 'service',
            ];
        })->values();

        $productRows = $productOrders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_id' => $order->order_number ?? "PO-{$order->id}",
                'customer' => $order->customer_name ?? 'Tanpa Nama',
                'summary' => $order->items->pluck('product.name')->filter()->join(', '),
                'total' => round((float) ($order->total_amount ?? 0)),
                'status' => $order->status,
                'type' => 'product',
            ];
        })->values();

        return response()->json([
            'overview' => [
                'summary' => [
                    'total_service_order' => $serviceOrders->count(),
                    'total_product_sale' => $totalProductSales,
                    'total_income' => round($totalIncome),
                    'total_expenses' => round($totalExpenses),
                ],
                'income_expense_chart' => $incomeExpenseChart,
                'expense_breakdown' => $expenseBreakdown,
                'customer_insight' => [
                    'new_customer' => $newCustomers,
                    'returning' => $returningCustomers,
                    'avg_order' => $avgOrder,
                ],
                'top_preferences' => [
                    'service' => [
                        'name' => $topService->keys()->first() ?? '-',
                        'count' => (int) ($topService->first() ?? 0),
                    ],
                    'product' => [
                        'name' => $topProduct->keys()->first() ?? '-',
                        'count' => (int) ($topProduct->first() ?? 0),
                    ],
                ],
            ],
            'services' => [
                'summary' => [
                    'total_service_order' => $serviceOrders->count(),
                    'total_product_sale' => $productRows->count(),
                    'total_income' => round($serviceRevenueTotal),
                ],
                'performance_data' => $servicePerformance,
                'status_data' => $serviceStatusDistribution,
                'order_trend' => $serviceOrderTrend,
            ],
            'products' => [
                'summary' => [
                    'total_sales' => round($productRevenueTotal),
                    'net_sales' => round($productRevenueTotal),
                    'product_sales' => $totalProductSales,
                ],
                'performance_data' => $productPerformance,
                'best_selling' => $bestSellingProducts,
                'low_performing' => $lowPerformingProducts,
            ],
            'exports' => [
                'overview' => $serviceRows->concat($productRows)->sortByDesc('order_id')->values(),
                'services' => $serviceRows,
                'products' => $productRows,
            ],
        ]);
    }

    private function serviceOrderTotal($order): float
    {
        $subtotal = $order->details->sum(function ($detail) {
            return ((float) $detail->price) * ((int) $detail->quantity);
        });

        $discountPercent = (float) ($order->discount ?? 0);
        $discountAmount = $subtotal * ($discountPercent / 100);

        return $subtotal - $discountAmount;
    }

    private function buildPeriodBuckets(string $period, int $year): array
    {
        $now = now();

        if ($period === 'day') {
            return collect(range(0, 23))->map(function ($hour) use ($now) {
                $start = $now->copy()->startOfDay()->addHours($hour);
                return [
                    'label' => $start->format('H:i'),
                    'start' => $start,
                    'end' => $start->copy()->endOfHour(),
                ];
            })->all();
        }

        if ($period === 'week') {
            $weekStart = $now->copy()->startOfWeek();

            return collect(range(0, 6))->map(function ($index) use ($weekStart) {
                $start = $weekStart->copy()->addDays($index)->startOfDay();
                return [
                    'label' => $start->format('D'),
                    'start' => $start,
                    'end' => $start->copy()->endOfDay(),
                ];
            })->all();
        }

        if ($period === 'month') {
            $monthStart = $now->copy()->startOfMonth();
            $daysInMonth = $monthStart->daysInMonth;

            return collect(range(1, $daysInMonth))->map(function ($day) use ($monthStart) {
                $start = $monthStart->copy()->day($day)->startOfDay();
                return [
                    'label' => $start->format('d'),
                    'start' => $start,
                    'end' => $start->copy()->endOfDay(),
                ];
            })->all();
        }

        return collect(range(1, 12))->map(function ($month) use ($year) {
            $start = Carbon::create($year, $month, 1)->startOfMonth();
            return [
                'label' => $start->format('M'),
                'start' => $start,
                'end' => $start->copy()->endOfMonth(),
            ];
        })->all();
    }
}
