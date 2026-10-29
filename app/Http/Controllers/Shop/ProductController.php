<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'search'    => 'nullable|string|max:100',
            'category'  => 'nullable|string|max:100',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'sort'      => 'nullable|in:newest,price_asc,price_desc,name',
        ]);

        $query = Product::query()->where('stock', '>=', 0);

        // Search
        if ($search = trim($request->input('search', ''))) {
            $like = '%' . addcslashes($search, '%_\\') . '%';
            $query->where(function ($q) use ($like) {
                $q->where('name', 'like', $like)
                  ->orWhere('sku', 'like', $like)
                  ->orWhere('category', 'like', $like);
            });
        }

        // Category
        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        // Price range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // Sort
        match ($request->input('sort', 'newest')) {
            'price_asc'  => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'name'       => $query->orderBy('name'),
            default      => $query->latest('id'),
        };

        $products = $query
            ->select(['id', 'name', 'price', 'image', 'category', 'stock', 'sku'])
            ->paginate(12)
            ->withQueryString();

        $categories = Product::query()
            ->select('category')
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('Shop/Products/index', [
            'products'   => $products,
            'filters'    => $request->only(['search', 'category', 'min_price', 'max_price', 'sort']),
            'categories' => $categories,
        ]);
    }

    public function show(Product $product)
    {
        // images relation ရှိရင် load လုပ်
        $product->load('images');

        $images = $product->images->pluck('path')->all();
        if (empty($images) && $product->image) {
            $images = [$product->image];
        }

        $related = Product::query()
            ->where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->where('stock', '>', 0)
            ->take(4)
            ->get(['id', 'name', 'price', 'image', 'category']);

        return Inertia::render('Shop/Products/show', [
            'product' => [
                'id'          => $product->id,
                'name'        => $product->name,
                'price'       => $product->price,
                'image'       => $product->image,
                'images'      => $images,
                'category'    => $product->category,
                'stock'       => $product->stock,
                'sku'         => $product->sku,
                'description' => $product->description ?? null,
            ],
            'related' => $related,
        ]);
    }
}