import { Link, useForm } from "@inertiajs/react";
import { ArrowLeft, ImageOff, Save } from "lucide-react";
import { FormEvent, useState } from "react";

/* =====================================================================
 *  TYPES  (data shape that comes from OrderController@edit)
 *  Controller: 'orderEdit' => $order->load(['user', 'items.product'])
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
    user: User | null;
    items: OrderItem[];
}
interface Props {
    orderEdit: Order;
    [key: string]: any;
}

/* =====================================================================
 *  OPTIONS  (must match the validation rules in OrderController@update)
 * ===================================================================== */
const STATUS_OPTIONS = [
    "pending",
    "processing",
    "shipped",
    "completed",
    "delivered",
    "cancelled",
] as const;

const PAYMENT_OPTIONS = ["unpaid", "paid", "refunded"] as const;

// Selected-button colors (full class names so Tailwind can detect them)
const statusActive: Record<string, string> = {
    pending: "border-yellow-500 bg-yellow-500/15 text-yellow-400",
    processing: "border-orange-500 bg-orange-500/15 text-orange-400",
    shipped: "border-blue-500 bg-blue-500/15 text-blue-400",
    completed: "border-green-500 bg-green-500/15 text-green-400",
    delivered: "border-purple-500 bg-purple-500/15 text-purple-400",
    cancelled: "border-red-500 bg-red-500/15 text-red-400",
};
const paymentActive: Record<string, string> = {
    paid: "border-green-500 bg-green-500/15 text-green-400",
    unpaid: "border-yellow-500 bg-yellow-500/15 text-yellow-400",
    refunded: "border-gray-400 bg-gray-500/15 text-gray-300",
};

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

/* =====================================================================
 *  SMALL COMPONENTS
 * ===================================================================== */
const ProductThumb = ({ src, name }: { src: string | null; name: string }) => {
    const [failed, setFailed] = useState(false);

    return (
        <div
            title={name}
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-700 bg-gray-800"
        >
            {src && !failed ? (
                <img
                    src={imageUrl(src)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={40}
                    height={40}
                    onError={() => setFailed(true)}
                    className="h-full w-full object-cover"
                />
            ) : (
                <ImageOff size={14} className="text-gray-500" />
            )}
        </div>
    );
};

// Group of choice buttons (works like radio buttons, keyboard accessible)
function ChoiceGroup({
    legend,
    name,
    options,
    value,
    activeStyles,
    onChange,
    error,
}: {
    legend: string;
    name: string;
    options: readonly string[];
    value: string;
    activeStyles: Record<string, string>;
    onChange: (v: string) => void;
    error?: string;
}) {
    return (
        <fieldset>
            <legend className="mb-2 text-sm font-medium">{legend}</legend>

            <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                    const selected = value === opt;
                    return (
                        <label
                            key={opt}
                            className={`cursor-pointer rounded-lg border px-3.5 py-2 text-sm capitalize transition focus-within:ring-2 focus-within:ring-blue-500 ${selected
                                    ? activeStyles[opt]
                                    : "border-gray-700 text-gray-300 hover:bg-gray-800"
                                }`}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={opt}
                                checked={selected}
                                onChange={() => onChange(opt)}
                                className="sr-only"
                            />
                            {opt}
                        </label>
                    );
                })}
            </div>

            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </fieldset>
    );
}

/* =====================================================================
 *  PAGE
 * ===================================================================== */
export default function OrderEdit({ orderEdit: order }: Props) {
    const items = order.items ?? [];

    // Only status + payment are editable (same as OrderController@update)
    const { data, setData, put, processing, errors, isDirty } = useForm({
        status: (order.status ?? "pending").toLowerCase(),
        payment: (order.payment ?? "unpaid").toLowerCase(),
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        // PUT /order/edit/{order} -> controller redirects to /orders with a success message
        put(`/order/edit/${order.id}`, { preserveScroll: true });
    };

    const statusChanged =
        data.status !== (order.status ?? "").toLowerCase();

    return (
        <div>
            {/* ===================== HEADER ===================== */}
            <div className="m-2 flex items-center gap-3">
                <Link
                    href="/orders"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 text-gray-300 transition hover:bg-gray-800"
                    aria-label="Back to orders"
                    title="Back to orders"
                >
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold">
                        Edit order #{order.id}
                    </h1>
                    <p className="text-sm text-gray-400">
                        Update the order status and payment
                    </p>
                </div>
            </div>

            <div className="m-2 grid gap-3 lg:grid-cols-3">
                {/* ===================== FORM ===================== */}
                <form
                    onSubmit={submit}
                    className="flex flex-col gap-6 rounded-xl border border-gray-700 p-5 lg:col-span-2"
                >
                    <ChoiceGroup
                        legend="Order status"
                        name="status"
                        options={STATUS_OPTIONS}
                        value={data.status}
                        activeStyles={statusActive}
                        onChange={(v) => setData("status", v)}
                        error={errors.status}
                    />

                    {statusChanged && (
                        <p className="-mt-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
                            The customer will be notified that the status changed
                            to <span className="font-medium">{data.status}</span>.
                        </p>
                    )}

                    <ChoiceGroup
                        legend="Payment"
                        name="payment"
                        options={PAYMENT_OPTIONS}
                        value={data.payment}
                        activeStyles={paymentActive}
                        onChange={(v) => setData("payment", v)}
                        error={errors.payment}
                    />

                    {/* Buttons */}
                    <div className="flex items-center gap-3 border-t border-gray-800 pt-5">
                        <button
                            type="submit"
                            disabled={processing || !isDirty}
                            className="flex h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={16} />
                            {processing ? "Saving..." : "Save changes"}
                        </button>

                        <Link
                            href={`/order/show/${order.id}`}
                            className="flex h-10 items-center rounded-lg border border-gray-700 px-4 text-sm text-gray-300 transition hover:bg-gray-800"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>

                {/* ===================== READ-ONLY SUMMARY ===================== */}
                <div className="flex flex-col gap-3">
                    {/* Customer */}
                    <div className="rounded-xl border border-gray-700 p-4">
                        <h2 className="mb-3 text-lg font-medium">Customer</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                                {order.user?.name?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                    {order.user?.name ?? "Deleted user"}
                                </p>
                                <p className="truncate text-xs text-gray-400">
                                    {order.user?.email ?? "-"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="rounded-xl border border-gray-700 p-4">
                        <h2 className="mb-3 text-lg font-medium">Items</h2>

                        <ul className="divide-y divide-gray-800">
                            {items.length === 0 && (
                                <li className="py-4 text-center text-sm text-gray-400">
                                    This order has no items.
                                </li>
                            )}

                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center gap-3 py-3"
                                >
                                    <ProductThumb
                                        src={item.product?.image ?? null}
                                        name={item.product?.name ?? ""}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {item.product?.name ?? "Deleted product"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {item.quantity} × {money(item.price)}
                                        </p>
                                    </div>
                                    <span className="text-sm">
                                        {money(Number(item.price) * item.quantity)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-2 flex items-center justify-between border-t border-gray-700 pt-3">
                            <span className="text-sm text-gray-400">Total</span>
                            <span className="text-lg font-semibold">
                                {money(order.total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
