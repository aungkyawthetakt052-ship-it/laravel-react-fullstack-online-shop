<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class StripePaymentController extends Controller
{
    public function checkout(Request $request, Product $product)
    {
        // quantity ကို စစ်ပါ
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:' . max(1, $product->stock)],
        ]);

        if ($product->stock < 1) {
            return back()->withErrors(['quantity' => 'Out of stock.']);
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        // Database ထဲက Price ကိုပဲ သုံးပါ (cent နဲ့)
        $amount = (int) round((float) $product->price * 100);
        

        if ($amount < 1) {
            abort(422, 'Invalid product price.');
        }

        $session = StripeSession::create([
            'mode' => 'payment',

            'line_items' => [
                [
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => $product->name,
                        ],
                        'unit_amount' => $amount,
                    ],
                    'quantity' => (int) $validated['quantity'],
                ],
            ],

            'metadata' => [
                'product_id' => (string) $product->id,
                'quantity'   => (string) $validated['quantity'],
            ],

            'success_url' => url('/checkout/success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url'  => url('/checkout/cancel'),
        ]);

        // Inertia request ကနေ external URL (Stripe) ကို redirect လုပ်ပါ
        return Inertia::location($session->url);
    }

  public function success(Request $request)
{
    $request->validate(['session_id' => ['required', 'string']]);

    Stripe::setApiKey(config('services.stripe.secret'));

    $session = StripeSession::retrieve($request->query('session_id'));

    if ($session->payment_status !== 'paid') {
        abort(403, 'Payment has not been completed.');
    }

    // Order ကို paid လုပ်မယ်
    $orderId = $session->metadata->order_id ?? null;

    if ($orderId) {
        \App\Models\Order::where('id', $orderId)
            ->where('payment', 'unpaid')
            ->update([
                'payment' => 'paid',
                'status' => 'processing',
            ]);
    }

    return Inertia::render('Shop/Paymentpage/success', [
        'message' => 'Payment successful! Thank you for your order.',
    ]);
}

    public function cancel()
    {
        return Inertia::render('Shop/Paymentpage/cancel');
    }
}