import { Link, router, useForm } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartItem {
  id: number;          // cart item id
  product_id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface Props {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

export default function CartIndex({ items = [], subtotal = 0, shipping = 0, total = 0 }: Props) {
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    router.patch(`/cart/${id}`, { quantity }, { preserveScroll: true });
  };

  const removeItem = (id: number) => {
    if (confirm('Remove this item from cart?')) {
      router.delete(`/cart/${id}`, { preserveScroll: true });
    }
  };

  if (items.length === 0) {
    return (
      <ShopLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="w-24 h-24 bg-rose-50  rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-rose-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven’t added anything yet.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-rose-600 text-white px-8 py-3 rounded-full font-medium hover:bg-rose-700 transition"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-rose-100"
              >
                <Link href={`/shop/products/${item.product_id}`} className="shrink-0">
                  <img
                    src={`/storage/${item.image}`}
                    alt={item.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl bg-rose-50"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link
                        href={`/shop/products/${item.product_id}`}
                        className="font-medium hover:text-rose-600 transition line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 dark:text-gray-200 hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-rose-200 rounded-full">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-rose-50 rounded-full"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-9 h-9 flex items-center justify-center hover:bg-rose-50 rounded-full disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-rose-100 p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-rose-100 pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-rose-600 text-white py-3.5 rounded-full font-medium hover:bg-rose-700 transition"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/shop"
                className="mt-3 block text-center text-sm text-rose-600 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}