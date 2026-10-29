<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
       public function index()
    {
        return Inertia::render('admin/dashboard', [
            'userCount' => User::count(),
            'orderCount' => Order::count(),
            'productCount' => Product::count(),

            // Show the five most recent users on the dashboard
            'users' => User::latest()
                ->take(5)
                ->get(['id', 'name', 'email']),
        ]);
    }
}
