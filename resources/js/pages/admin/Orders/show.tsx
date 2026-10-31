import { Link } from "@inertiajs/react";
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    ImageOff,
    Mail,
    Pencil,
    User as UserIcon,
} from "lucide-react";
import { useState } from "react";

/* =====================================================================
 *  TYPES  (data shape that comes from OrderController@show)
 *  Controller: 'orderDetail' => $order->load(['user', 'items.product'])
 * ===================================================================== */
interface User {
    id: number;
    name: string;
    email: string;
}
interface Product {
    id: number;
    name: string;
    image: string | null;
}
interface OrderItem {
    id: number;
    quantity: number;
    price: number | string;
    product: Product | null;
}
interface Order {
    id: number;
    total: number | string;
    status: string;
    payment: string | null;
    created_at: string;
    updated_at: string;
    user: User | null;
    items: OrderItem[];
}
interface Props {
    orderDetail: Order;
    [key: string]: any;
}

/* =====================================================================
 *  HELPERS
 * ===================================================================== */
const imageUrl = (path: string | null) =>
    path ? `/storage/${path.replace(/^\/+/, "")}` : "";

const money = (n: number | string) =>
    `$${Number(n || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const statusStyle: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
    processing: "bg-orange-500/15 text-orange-400 border-orange-500/40",
    shipped: "bg-blue-500/15 text-blue-400 border-blue-500/40",
    completed: "bg-green-500/15 text-green-400 border-green-500/40",
    delivered: "bg-purple-500/15 text-purple-400 border-purple-500/40",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/40",
};
const paymentStyle: Record<string, string> = {
    paid: "bg-green-500/15 text-green-400 border-green-500/40",
    unpaid: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
    refunded: "bg-gray-500/15 text-gray-300 border-gray-500/40",
};

/* =====================================================================
 *  SMALL COMPONENTS
 * ===================================================================== */
const Badge = ({
    value,
    styles,
}: {
    value: string;
    styles: Record<string, string>;
}) => (
    <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles[value?.toLowerCase()] ??
            "bg-gray-500/15 text-gray-300 border-gray-500/40"
            }`}
    >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {value || "-"}
    </span>
);

const ProductThumb = ({ src, name }: { src: string | null; name: string }) => {
    const [failed, setFailed] = useState(false);

    return (
        <div
            title={name}
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-700 bg-gray-800"
        >
            {src && !failed ? (
                <img
                    src={imageUrl(src)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={56}
                    height={56}
                    onError={() => setFailed(true)}
                    className="h-full w-full object-cover"
                />
            ) : (
                <ImageOff size={18} className="text-gray-500" />
            )}
        </div>
    );
};

// A labelled row inside the summary box
const Row = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-right">{children}</span>
    </div>
);

/* =====================================================================
 *  PAGE
 * ===================================================================== */
export default function OrderShow({ orderDetail: order }: Props) {
    const items = order.items ?? [];

    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce(
        (sum, i) => sum + Number(i.price) * i.quantity,
        0,
    );

    return (
        <div>
            {/* ===================== HEADER ===================== */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Link
                        href="/orders"
                        className="m-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>

                    <h1 className="text-2xl m-3 font-bold tracking-tight">
                        Order #{order.id}
                    </h1>
                    <p className="mt-1 m-3 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar size={14} />
                        Placed on {formatDateTime(order.created_at)}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Badge value={order.status} styles={statusStyle} />
                    <Link
                        href={`/order/edit/${order.id}`}
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                        <Pencil size={16} />
                        Edit order
                    </Link>
                </div>
            </div>

            {/* ===================== BODY: items (left) + side boxes (right) ===================== */}
            <div className="m-2 grid gap-3 lg:grid-cols-3">
                {/* ----- Items table ----- */}
                <div className="overflow-hidden rounded-xl border border-gray-700 lg:col-span-2">
                    <div className="flex items-center justify-between p-4">
                        <h2 className="text-xl font-medium">Items</h2>
                        <span className="text-sm text-gray-400">
                            {totalQty} {totalQty === 1 ? "item" : "items"}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto text-left">
                            <thead className="border-y border-gray-700 text-xs uppercase tracking-wide text-gray-400 dark:bg-gray-900/60">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Product</th>
                                    <th className="px-4 py-3 font-medium">Price</th>
                                    <th className="px-4 py-3 font-medium">Qty</th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-800">
                                {items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-10 text-center text-sm text-gray-400"
                                        >
                                            This order has no items.
                                        </td>
                                    </tr>
                                )}

                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <ProductThumb
                                                    src={item.product?.image ?? null}
                                                    name={item.product?.name ?? ""}
                                                />
                                                <span className="text-sm font-medium">
                                                    {item.product?.name ??
                                                        "Deleted product"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {money(item.price)}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-4 text-right text-sm font-medium">
                                            {money(
                                                Number(item.price) * item.quantity,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals footer */}
                    <div className="border-t border-gray-700 p-4">
                        <div className="ml-auto max-w-xs divide-y divide-gray-800">
                            <Row label="Items subtotal">{money(subtotal)}</Row>
                            <Row label="Order total">
                                <span className="text-lg font-semibold">
                                    {money(order.total)}
                                </span>
                            </Row>
                        </div>
                    </div>
                </div>

                {/* ----- Side column ----- */}
                <div className="flex flex-col gap-3">
                    {/* Customer */}
                    <div className="rounded-xl border border-gray-700 p-4">
                        <h2 className="mb-4 text-lg font-medium">Customer</h2>

                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg text-white">
                                {order.user?.name?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                            <div className="min-w-0">
                                <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                                    <UserIcon size={14} className="shrink-0 text-gray-400" />
                                    {order.user?.name ?? "Deleted user"}
                                </p>
                                <p className="flex items-center gap-1.5 truncate text-xs text-gray-400">
                                    <Mail size={12} className="shrink-0" />
                                    {order.user?.email ?? "-"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-xl border border-gray-700 p-4">
                        <h2 className="mb-2 flex items-center gap-2 text-lg font-medium">
                            <CreditCard size={18} className="text-gray-400" />
                            Order summary
                        </h2>

                        <div className="divide-y divide-gray-800">
                            <Row label="Order ID">#{order.id}</Row>
                            <Row label="Status">
                                <Badge value={order.status} styles={statusStyle} />
                            </Row>
                            <Row label="Payment">
                                <Badge
                                    value={order.payment || "unpaid"}
                                    styles={paymentStyle}
                                />
                            </Row>
                            <Row label="Created">{formatDateTime(order.created_at)}</Row>
                            <Row label="Last updated">
                                {formatDateTime(order.updated_at)}
                            </Row>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
