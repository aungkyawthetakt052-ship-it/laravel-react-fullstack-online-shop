<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::query()
            ->where('user_id', Auth::id())
            ->with(['items.product:id,name,image'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Shop/Orders/index', [
            'orders' => $orders,
        ]);
    }

    public function show(Order $order)
    {
        // ကိုယ့် order ပဲ ကြည့်ခွင့်ရှိ
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $order->load(['items.product:id,name,image']);

        return Inertia::render('Shop/Orders/show', [
            'order' => $order,
        ]);
    }
}
