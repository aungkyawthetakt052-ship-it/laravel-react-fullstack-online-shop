<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $featured = Product::query()
            ->where('stock', '>', 0)
            ->latest('id')
            ->take(8)
            ->get(['id', 'name', 'price', 'image', 'category']);

        $newArrivals = Product::query()
            ->where('stock', '>', 0)
            ->latest('id')
            ->take(8)
            ->get(['id', 'name', 'price', 'image', 'category']);

        $bestSellers = Product::query()
            ->where('stock', '>', 0)
            ->inRandomOrder() // နောက်မှ order_items count နဲ့ စစ်လို့ရအောင် ပြောင်းနိုင်တယ်
            ->take(8)
            ->get(['id', 'name', 'price', 'image', 'category']);

        $categories = Product::query()
            ->selectRaw('category, COUNT(*) as count')
            ->whereNotNull('category')
            ->groupBy('category')
            ->get()
            ->map(fn ($row) => [
                'name'  => $row->category,
                'slug'  => strtolower($row->category),
                'count' => $row->count,
                'image' => Product::where('category', $row->category)
                    ->whereNotNull('image')
                    ->value('image') ?? null,
            ]);

        return Inertia::render('Shop/home', [
            'featured'    => $featured,
            'newArrivals' => $newArrivals,
            'bestSellers' => $bestSellers,
            'categories'  => $categories,
        ]);
    }
}