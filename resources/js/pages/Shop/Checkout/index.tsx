import { Link, useForm } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { useState } from 'react';
import { CreditCard, Truck, MapPin } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Props {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  user?: {
    name: string;
    email: string;
  };
}

export default function CheckoutIndex({ items = [], subtotal = 0, shipping = 0, total = 0, user }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Myanmar',
    shipping_method: 'standard',
    payment_method: 'cod',
    notes: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/checkout', {
      onSuccess: () => {
        // redirect handled by backend
      },
    });
  };

  return (
    <ShopLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>

        <form onSubmit={submit}>
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact */}
              <section className="bg-white rounded-2xl border border-rose-100 p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-500" />
                  Contact & Shipping
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      required
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      required
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">Address *</label>
                    <input
                      type="text"
                      value={data.address}
                      onChange={(e) => setData('address', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      required
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      value={data.city}
                      onChange={(e) => setData('city', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State / Region</label>
                    <input
                      type="text"
                      value={data.state}
                      onChange={(e) => setData('state', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={data.postal_code}
                      onChange={(e) => setData('postal_code', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <select
                      value={data.country}
                      onChange={(e) => setData('country', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    >
                      <option value="Myanmar">Myanmar</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Shipping Method */}
              <section className="bg-white rounded-2xl border border-rose-100 p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-rose-500" />
                  Shipping Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-rose-200 rounded-xl cursor-pointer hover:bg-rose-50 has-checked:border-rose-500 has-checked:bg-rose-50">
                    <input
                      type="radio"
                      name="shipping_method"
                      value="standard"
                      checked={data.shipping_method === 'standard'}
                      onChange={(e) => setData('shipping_method', e.target.value)}
                      className="text-rose-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Standard Shipping</p>
                      <p className="text-sm text-gray-500">3–5 business days</p>
                    </div>
                    <span className="font-medium">Free</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-rose-200 rounded-xl cursor-pointer hover:bg-rose-50 has-checked:border-rose-500 has-checked:bg-rose-50">
                    <input
                      type="radio"
                      name="shipping_method"
                      value="express"
                      checked={data.shipping_method === 'express'}
                      onChange={(e) => setData('shipping_method', e.target.value)}
                      className="text-rose-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Express Shipping</p>
                      <p className="text-sm text-gray-500">1–2 business days</p>
                    </div>
                    <span className="font-medium">$8.00</span>
                  </label>
                </div>
              </section>

              {/* Payment */}
              <section className="bg-white rounded-2xl border border-rose-100 p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rose-500" />
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-rose-200 rounded-xl cursor-pointer hover:bg-rose-50 has-checked:border-rose-500 has-checked:bg-rose-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={data.payment_method === 'cod'}
                      onChange={(e) => setData('payment_method', e.target.value)}
                      className="text-rose-600"
                    />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-rose-200 rounded-xl cursor-pointer hover:bg-rose-50 has-checked:border-rose-500 has-checked:bg-rose-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank"
                      checked={data.payment_method === 'bank'}
                      onChange={(e) => setData('payment_method', e.target.value)}
                      className="text-rose-600"
                    />
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-gray-500">KBZ / Wave / AYA</p>
                    </div>
                  </label>
                </div>
              </section>

              {/* Notes */}
              <section className="bg-white rounded-2xl border border-rose-100 p-6">
                <label className="block text-sm font-medium mb-2">Order Notes (optional)</label>
                <textarea
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="Any special instructions..."
                />
              </section>
            </div>

            {/* Right - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-rose-100 p-6 sticky top-24">
                <h2 className="font-semibold text-lg mb-4">Your Order</h2>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={`/storage/${item.image}`}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover bg-rose-50"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm border-t border-rose-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{data.shipping_method === 'express' ? '$8.00' : 'Free'}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2">
                    <span>Total</span>
                    <span>
                      $
                      {(
                        total + (data.shipping_method === 'express' ? 8 : 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing || items.length === 0}
                  className="mt-6 w-full bg-rose-600 text-white py-3.5 rounded-full font-medium hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {processing ? 'Placing Order...' : 'Place Order'}
                </button>

                <p className="mt-4 text-xs text-center text-gray-400">
                  By placing your order you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ShopLayout>
  );
}