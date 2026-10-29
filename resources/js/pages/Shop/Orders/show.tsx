

import { Link } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { Package, MapPin, CreditCard, ArrowLeft } from 'lucide-react';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string;
  };
}

interface Order {
  id: number;
  total: number;
  status: string;
  payment: string;
  payment_method?: string;
  shipping_method?: string;
  shipping_name?: string;
  shipping_email?: string;
  shipping_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal?: string;
  shipping_country?: string;
  notes?: string;
  created_at: string;
  items: OrderItem[];
}

interface Props {
  order: Order;
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderShow({ order }: Props) {
  const subtotal = order.items?.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  ) || 0;

  return (
    <ShopLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">Order #{order.id}</h1>
            <p className="text-gray-500 mt-1">
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <span
            className={`text-sm font-medium px-4 py-1.5 rounded-full capitalize ${
              statusColor[order.status] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {order.status}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-rose-100 p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-500" />
                Order Items
              </h2>

              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link href={`/shop/products/${item.product?.id}`}>
                      <img
                        src={`/storage/${item.product?.image}`}
                        alt={item.product?.name}
                        className="w-20 h-20 rounded-xl object-cover bg-rose-50"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/products/${item.product?.id}`}
                        className="font-medium hover:text-rose-600 transition line-clamp-1"
                      >
                        {item.product?.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {order.notes && (
              <div className="bg-white rounded-2xl border border-rose-100 p-6">
                <h3 className="font-medium mb-2">Order Notes</h3>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl border border-rose-100 p-6">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {order.shipping_method === 'express' ? '$8.00' : 'Free / Standard'}
                  </span>
                </div>
                <div className="border-t border-rose-100 pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-rose-100 p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                Shipping Address
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shipping_name}</p>
                <p>{order.shipping_address}</p>
                <p>
                  {[order.shipping_city, order.shipping_state, order.shipping_postal]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p>{order.shipping_country}</p>
                <p className="pt-2">{order.shipping_phone}</p>
                <p>{order.shipping_email}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-rose-100 p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-500" />
                Payment
              </h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="capitalize">
                    {order.payment_method === 'cod'
                      ? 'Cash on Delivery'
                      : order.payment_method === 'bank'
                      ? 'Bank Transfer'
                      : order.payment_method || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="capitalize font-medium">{order.payment}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}