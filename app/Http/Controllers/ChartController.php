<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChartController extends Controller
{
    public function index()
    {
        // လအလိုက် ရောင်းအား (Line / Bar chart အတွက်)
        $monthlySales = Order::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('SUM(total) as total')
        )
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($row) => [
                'name' => date('M', mktime(0, 0, 0, $row->month, 1)),
                'total' => (float) $row->total,
            ]);

        // Status အလိုက် order အရေအတွက် (Pie chart အတွက်)
        $orderStatus = Order::select('status', DB::raw('COUNT(*) as value'))
            ->groupBy('status')
            ->get()
            ->map(fn($row) => [
                'name' => $row->status,
                'value' => $row->value,
            ]);
        return Inertia::render('admin/Chart/chart', [
            'monthlySales' => $monthlySales,
            'orderStatus' => $orderStatus,
        ]);
    }
}