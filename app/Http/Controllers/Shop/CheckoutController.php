<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index()
    {
        $cart = session('cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $items = [];
        $subtotal = 0;

        foreach ($cart as $productId => $row) {
            $product = Product::find($productId);
            if (! $product) {
                continue;
            }

            $qty = (int) $row['quantity'];
            $subtotal += $product->price * $qty;

            $items[] = [
                'id' => $productId,
                'name' => $product->name,
                'price' => (float) $product->price,
                'image' => $product->image,
                'quantity' => $qty,
            ];
        }

        if (empty($items)) {
            session()->forget('cart');

            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $shipping = $subtotal >= 50 ? 0 : 5;
        $total = $subtotal + $shipping;
        $user = Auth::user();

        return Inertia::render('Shop/Checkout/index', [
            'items' => $items,
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'total' => $total,
            'user' => $user ? [
                'name' => $user->name,
                'email' => $user->email,
            ] : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:30',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:100',
            'shipping_method' => 'required|in:standard,express',
            'payment_method' => 'required|in:cod,bank',
            'notes' => 'nullable|string|max:1000',
        ]);

        $cart = session('cart', []);
        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        try {
            $order = DB::transaction(function () use ($validated, $cart) {
                $subtotal = 0;
                $orderItems = [];

                foreach ($cart as $productId => $row) {
                    $product = Product::lockForUpdate()->find($productId);

                    if (! $product) {
                        throw new \Exception('One of the products no longer exists.');
                    }

                    $qty = (int) $row['quantity'];

                    if ($product->stock < $qty) {
                        throw new \Exception("\"{$product->name}\" has only {$product->stock} left in stock.");
                    }

                    $subtotal += $product->price * $qty;

                    $orderItems[] = [
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'price' => $product->price,
                    ];

                    $product->decrement('stock', $qty);
                }

                $shippingCost = $validated['shipping_method'] === 'express'
                    ? 8
                    : ($subtotal >= 50 ? 0 : 5);

                $total = $subtotal + $shippingCost;

                // Order ဖန်တီး
                $order = Order::create([
                    'user_id' => Auth::id(),            // null ဖြစ်နိုင် (guest)
                    'total' => $total,
                    'status' => 'pending',
                    'payment' => 'unpaid',
                    'shipping_name' => $validated['name'],
                    'shipping_email' => $validated['email'],
                    'shipping_phone' => $validated['phone'],
                    'shipping_address' => $validated['address'],
                    'shipping_city' => $validated['city'],
                    'shipping_state' => $validated['state'] ?? null,
                    'shipping_postal' => $validated['postal_code'] ?? null,
                    'shipping_country' => $validated['country'],
                    'shipping_method' => $validated['shipping_method'],
                    'payment_method' => $validated['payment_method'],
                    'notes' => $validated['notes'] ?? null,
                ]);

                // Order items ထည့်
                foreach ($orderItems as $item) {
                    $order->items()->create($item);
                }

                return $order;
            });
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }

        // Cart ရှင်း
        session()->forget('cart');

        // login ဝင်ထားရင် order detail ကို သွား
        // မဝင်ရင် home သို့မဟုတ် thank-you page
        if (Auth::check()) {
            return redirect()
                ->route('account.orders.show', $order->id)
                ->with('success', "Order #{$order->id} placed successfully!");
        }

        return redirect()
            ->route('home')
            ->with('success', "Order #{$order->id} placed successfully! We will contact you soon.");
    }
}
