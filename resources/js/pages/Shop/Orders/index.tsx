

import { Link } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';

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
  created_at: string;
  items: OrderItem[];
}

interface Props {
  orders: {
    data: Order[];
    links: any[];
    meta?: any;
  };
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersIndex({ orders }: Props) {
  if (!orders?.data?.length) {
    return (
      <ShopLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-rose-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold mb-2">No orders yet</h1>
          <p className="text-gray-500 mb-8">You haven’t placed any orders.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-rose-600 text-white px-8 py-3 rounded-full font-medium hover:bg-rose-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-serif font-bold mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.data.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-rose-100 p-5 sm:p-6 hover:border-rose-300 hover:shadow-sm transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                      statusColor[order.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.status}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {order.items?.slice(0, 4).map((item) => (
                  <img
                    key={item.id}
                    src={`/storage/${item.product?.image}`}
                    alt={item.product?.name}
                    className="w-14 h-14 rounded-lg object-cover bg-rose-50 shrink-0"
                  />
                ))}
                {(order.items?.length || 0) > 4 && (
                  <span className="text-sm text-gray-500 -shrink-0">
                    +{order.items.length - 4} more
                  </span>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                </span>
                <span className="font-semibold text-lg">
                  ${Number(order.total).toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {orders.links && orders.links.length > 3 && (
          <div className="mt-10 flex justify-center gap-2">
            {orders.links.map((link: any, i: number) => (
              <Link
                key={i}
                href={link.url || '#'}
                className={`px-4 py-2 text-sm rounded-lg ${
                  link.active
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border border-rose-200 hover:bg-rose-50'
                } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}