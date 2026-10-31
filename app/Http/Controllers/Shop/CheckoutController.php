<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

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
            'payment_method' => 'required|in:cod,bank,stripe',
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

                $order = Order::create([
                    'user_id' => Auth::id(),
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

        // ==============================
        // Stripe ကို ရွေးထားရင် ဒီမှာ ရပ်ပြီး Stripe ကို ပို့မယ်
        // ==============================
        if ($validated['payment_method'] === 'stripe') {
            Stripe::setApiKey(config('services.stripe.secret'));

            $order->load('items.product');

            $lineItems = $order->items->map(function ($item) {
                // price က dollar အနေနဲ့ ရှိတယ်လို့ ယူဆပြီး cent ပြောင်း
                $unitAmount = (int) round((float) $item->price * 100);

                // လုံခြုံရေးအတွက် စစ်ဆေး
                if ($unitAmount < 1) {
                    throw new \Exception("Invalid price for product: {$item->product->name}");
                }

                return [
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => $item->product->name,
                        ],
                        'unit_amount' => $unitAmount,
                    ],
                    'quantity' => $item->quantity,
                ];
            })->all();

            $itemsTotal = $order->items->sum(fn ($i) => $i->price * $i->quantity);
            $shippingFee = $order->total - $itemsTotal;

            if ($shippingFee > 0) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => ['name' => 'Shipping'],
                        'unit_amount' => (int) round($shippingFee * 100),
                    ],
                    'quantity' => 1,
                ];
            }

            try {
                $session = StripeSession::create([
                    'mode' => 'payment',
                    'line_items' => $lineItems,
                    'customer_email' => $order->shipping_email,
                    'metadata' => ['order_id' => (string) $order->id],
                    'success_url' => url('/checkout/success').'?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url' => url('/checkout/cancel'),
                ]);
            } catch (\Exception $e) {
                Log::error('Stripe error: '.$e->getMessage());

                return back()->with('error', 'Payment error: '.$e->getMessage());
            }

            session()->forget('cart');

            return Inertia::location($session->url);
        }

        // ==============================
        // COD / Bank Transfer
        // ==============================
        session()->forget('cart');

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
