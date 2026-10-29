<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cart = session('cart', []);
        $items = [];
        $subtotal = 0;

        foreach ($cart as $productId => $row) {
            $product = Product::find($productId);
            if (!$product) continue;

            $qty = (int) $row['quantity'];
            $lineTotal = $product->price * $qty;
            $subtotal += $lineTotal;

            $items[] = [
                'id'         => $productId, // session key အဖြစ် သုံး
                'product_id' => $product->id,
                'name'       => $product->name,
                'price'      => (float) $product->price,
                'image'      => $product->image,
                'quantity'   => $qty,
                'stock'      => $product->stock,
            ];
        }

        $shipping = $subtotal >= 50 ? 0 : 5; // $50 အထက် free shipping
        $total = $subtotal + $shipping;

        return Inertia::render('Shop/Cart/index', [
            'items'    => $items,
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'total'    => $total,
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1|max:99',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            return back()->with('error', 'Not enough stock available.');
        }

        $cart = session('cart', []);

        if (isset($cart[$product->id])) {
            $newQty = $cart[$product->id]['quantity'] + $request->quantity;
            if ($newQty > $product->stock) {
                return back()->with('error', 'Cannot add more than available stock.');
            }
            $cart[$product->id]['quantity'] = $newQty;
        } else {
            $cart[$product->id] = [
                'quantity' => $request->quantity,
            ];
        }

        session(['cart' => $cart]);

        return back()->with('success', 'Product added to cart.');
    }

    public function update(Request $request, $item)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        $cart = session('cart', []);

        if (!isset($cart[$item])) {
            return back()->with('error', 'Item not found in cart.');
        }

        $product = Product::find($item);
        if (!$product || $request->quantity > $product->stock) {
            return back()->with('error', 'Not enough stock.');
        }

        $cart[$item]['quantity'] = $request->quantity;
        session(['cart' => $cart]);

        return back()->with('success', 'Cart updated.');
    }

    public function remove($item)
    {
        $cart = session('cart', []);

        if (isset($cart[$item])) {
            unset($cart[$item]);
            session(['cart' => $cart]);
        }

        return back()->with('success', 'Item removed from cart.');
    }
}