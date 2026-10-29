import ActionMenu from "@/components/action-menu";
import FlashMessage from "@/components/flash-message";
import { confirmDelete } from "@/lib/alert";
import { Link, router } from "@inertiajs/react";
import {
    Calendar,
    CheckCircle2,
    Clock,
    ImageOff,
    Package,
    Plus,
    Search,
    ShoppingCart,
    X,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

/* =====================================================================
 *  TYPES  (data shape that comes from OrderController@index)
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
    product: Product | null;
}
interface Order {
    id: number;
    total: number;
    status: string;
    payment: string | null;
    created_at: string;
    user: User;
    items: OrderItem[];
}
interface Stats {
    total: number;
    growth: number | null; // % change vs previous 30 days (null = no data)
    pending: number;
    processing: number;
    delivered: number;
    cancelled: number;
}
// Laravel paginator shape
interface PageLink {
    url: string | null;
    label: string;
    active: boolean;
}
interface Paginated<T> {
    data: T[];
    links: PageLink[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
}
interface Props {
    orders: Paginated<Order>;
    stats: Stats;
    filters?: { search?: string; from?: string; to?: string };
    [key: string]: any;
}

/* =====================================================================
 *  HELPERS
 * ===================================================================== */

// Build a safe image URL (removes the leading slash to avoid "storage//images")
const imageUrl = (path: string | null) =>
    path ? `/storage/${path.replace(/^\/+/, "")}` : "";

// Example output: "Oct 24, 2026"
const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

// Example output: "01:08 PM"
const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

// Badge colors per status (full class names so Tailwind can detect them)
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

// Icon box + text colors for the stat cards
const cardTheme = {
    blue: "bg-blue-500/15 text-blue-400",
    orange: "bg-orange-500/15 text-orange-400",
    cyan: "bg-cyan-500/15 text-cyan-400",
    green: "bg-green-500/15 text-green-400",
    red: "bg-red-500/15 text-red-400",
};

// Laravel gives labels like "&laquo; Previous" / "Next &raquo;"
const pageLabel = (label: string) =>
    label
        .replace("&laquo; Previous", "Prev")
        .replace("Next &raquo;", "Next");

// Only reload what changes when searching / paging (stats stay the same)
const PARTIAL_PROPS = ["orders", "filters"];

/* =====================================================================
 *  SMALL COMPONENTS
 * ===================================================================== */

// Badge: rounded pill with a small dot (used for Status and Payment)
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

// StatCard: one summary box (icon + label + big number + footer text)
const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
    footer,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: keyof typeof cardTheme;
    footer: React.ReactNode;
}) => (
    <div className="flex items-center gap-4 rounded-xl border border-gray-700 dark:bg-gray-900/40 p-4">
        {/* Icon box */}
        <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cardTheme[color]}`}
        >
            <Icon size={22} />
        </div>
        {/* Text */}
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-semibold leading-tight text-white">
                {value}
            </p>
            <p className="text-xs text-gray-400">{footer}</p>
        </div>
    </div>
);

// ProductThumb: small product picture. Shows an icon if the image is missing/broken
const ProductThumb = ({ src, name }: { src: string | null; name: string }) => {
    const [failed, setFailed] = useState(false);

    return (
        <div
            title={name}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-gray-700 bg-gray-800"
        >
            {src && !failed ? (
                <img
                    src={imageUrl(src)}
                    alt="" // empty alt so broken images don't show ugly text
                    loading="lazy" // don't block the page
                    decoding="async"
                    width={36}
                    height={36}
                    onError={() => setFailed(true)}
                    className="h-full w-full object-cover"
                />
            ) : (
                <ImageOff size={14} className="text-gray-500" />
            )}
        </div>
    );
};

// Pagination: Prev | 1 2 3 ... | Next  (built from Laravel's paginator links)
const Pagination = ({ orders }: { orders: Paginated<Order> }) => {
    if (orders.last_page <= 1) return null;

    const base =
        "flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm transition";

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-700 p-4">
            <p className="text-sm text-gray-400">
                Showing {orders.from ?? 0}–{orders.to ?? 0} of {orders.total}{" "}
                orders
            </p>

            <nav className="flex flex-wrap items-center gap-1">
                {orders.links.map((link, i) => {
                    const label = pageLabel(link.label);

                    // Disabled (no url) e.g. "Prev" on page 1 or the "..." gap
                    if (!link.url) {
                        return (
                            <span
                                key={i}
                                className={`${base} cursor-not-allowed border-gray-800 text-gray-600`}
                            >
                                {label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={i}
                            href={link.url}
                            preserveState
                            preserveScroll
                            only={PARTIAL_PROPS}
                            className={`${base} ${link.active
                                ? "border-blue-500 bg-blue-600 text-white"
                                : "border-gray-700 text-gray-300 hover:bg-gray-800"
                                }`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

/* =====================================================================
 *  PAGE
 * ===================================================================== */
export default function Orders({ orders, stats, filters }: Props) {
    // ----- State (initial values come from the URL filters) -----
    const [search, setSearch] = useState(filters?.search ?? "");
    const [from, setFrom] = useState(filters?.from ?? "");
    const [to, setTo] = useState(filters?.to ?? "");

    // ----- Realtime search + date filter (debounced 300ms) -----
    // Skips the request when nothing changed (fixes the duplicate request on
    // page load caused by React StrictMode running effects twice in dev).
    useEffect(() => {
        const unchanged =
            search === (filters?.search ?? "") &&
            from === (filters?.from ?? "") &&
            to === (filters?.to ?? "");
        if (unchanged) return;

        const timer = setTimeout(() => {
            router.get(
                "/orders",
                // empty values are dropped so the URL stays clean
                {
                    ...(search && { search }),
                    ...(from && { from }),
                    ...(to && { to }),
                }, // no "page" here -> always back to page 1
                {
                    preserveState: true, // keep input focus
                    preserveScroll: true,
                    replace: true, // don't fill browser history
                    only: PARTIAL_PROPS, // stats don't depend on filters
                },
            );
        }, 300);

        // Cancel the previous timer if the user keeps typing
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, from, to]);

    // Percent of total, e.g. pct(14) -> "35.0"
    const pct = (n: number) =>
        stats.total > 0 ? ((n / stats.total) * 100).toFixed(1) : "0.0";

    return (
        <div>
            {/* ===================== HEADER ===================== */}
            <div className="m-2 flex flex-wrap items-center justify-between gap-3">
                {/* Title */}
                <div>
                    <h1 className="text-2xl font-semibold">Order page</h1>
                    <p className="text-sm text-gray-400">
                        Manage and track all customers orders
                    </p>
                    <FlashMessage/>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date range box: from -> to */}
                    <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/40 px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                        <Calendar size={16} className="shrink-0 text-gray-400" />

                        {/* Input: from date */}
                        <input
                            type="date"
                            value={from}
                            max={to || undefined}
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-29.5 bg-transparent text-sm text-gray-200 outline-none [scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                        <span className="text-gray-600">→</span>

                        {/* Input: to date */}
                        <input
                            type="date"
                            value={to}
                            min={from || undefined}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-29.5 bg-transparent text-sm text-gray-200 outline-none [scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden"
                        />

                        {/* Button: clear dates (only visible when a date is set) */}
                        {(from || to) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFrom("");
                                    setTo("");
                                }}
                                className="rounded p-0.5 text-gray-400 hover:bg-gray-700 hover:text-white"
                                title="Clear dates"
                                aria-label="Clear dates"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Button: Create order */}
                    <Link
                        href="/order/create"
                        className="flex h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                        <Plus size={16} /> Create order
                    </Link>
                </div>
            </div>

            {/* ===================== STAT CARDS ===================== */}
            <div className="m-2 grid grid-cols-2 gap-3 lg:grid-cols-5">
                {/* Card: Total orders + growth vs last 30 days */}
                <StatCard
                    label="Total Orders"
                    value={stats.total}
                    icon={ShoppingCart}
                    color="blue"
                    footer={
                        stats.growth === null ? (
                            "No previous data"
                        ) : (
                            <>
                                <span
                                    className={
                                        stats.growth >= 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                    }
                                >
                                    {stats.growth >= 0 ? "↑" : "↓"}{" "}
                                    {Math.abs(stats.growth)}%
                                </span>{" "}
                                vs. last 30 days
                            </>
                        )
                    }
                />

                {/* Card: Pending */}
                <StatCard
                    label="Pending"
                    value={stats.pending}
                    icon={Clock}
                    color="orange"
                    footer={`${pct(stats.pending)}% of total`}
                />

                {/* Card: Processing */}
                <StatCard
                    label="Processing"
                    value={stats.processing}
                    icon={Package}
                    color="cyan"
                    footer={`${pct(stats.processing)}% of total`}
                />

                {/* Card: Delivered */}
                <StatCard
                    label="Delivered"
                    value={stats.delivered}
                    icon={CheckCircle2}
                    color="green"
                    footer={`${pct(stats.delivered)}% of total`}
                />

                {/* Card: Cancelled */}
                <StatCard
                    label="Cancelled"
                    value={stats.cancelled}
                    icon={XCircle}
                    color="red"
                    footer={`${pct(stats.cancelled)}% of total`}
                />
            </div>

            {/* ===================== ORDERS TABLE ===================== */}
            <div className="m-2 overflow-hidden rounded-xl border border-gray-700">
                {/* Table header bar: title + search */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <h2 className="text-xl font-medium">Recent orders</h2>

                    {/* Search box (realtime) */}
                    <div className="group relative">
                        <Search
                            size={18}
                            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
                        />

                        {/* Input: search (press Esc to clear) */}
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Escape" && setSearch("")
                            }
                            placeholder="Search order ..."
                            className="w-72 rounded-md border border-gray-700 bg-transparent py-2 pl-9 pr-10 text-sm"
                        />

                        {/* Button: clear search (only visible when there is text) */}
                        {search && (
                            <div className="group/clear absolute right-2 top-1/2 -translate-y-1/2">
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-700 hover:text-white"
                                    aria-label="Clear search"
                                >
                                    <X size={16} />
                                </button>

                                {/* Tooltip: "Clear [Esc]" shown on hover */}
                                <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-200 opacity-0 shadow-lg transition-opacity group-hover/clear:opacity-100">
                                    Clear
                                    <kbd className="ml-1.5 rounded bg-gray-700 px-1.5 py-0.5 font-mono text-[10px]">
                                        Esc
                                    </kbd>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table (scrolls sideways on small screens) */}
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-left">
                        <thead className="border-y border-gray-700 dark:bg-gray-900/60 text-xs uppercase tracking-wide text-gray-400">
                            <tr>
                                <th className="px-4 py-3 font-medium">#</th>
                                <th className="px-4 py-3 font-medium">Customers</th>
                                <th className="px-4 py-3 font-medium">Items</th>
                                <th className="px-4 py-3 font-medium">Totals</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Payment</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-800">
                            {/* Empty state: nothing matched the search/filter */}
                            {orders.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-12 text-center text-sm text-gray-400"
                                    >
                                        No orders found. Try a different search
                                        or date range.
                                    </td>
                                </tr>
                            )}

                            {orders.data.map((order) => (
                                <tr
                                    key={order.id}
                                    className="transition-colors dark:hover:bg-gray-800/40 hover:bg-gray-200/40"
                                >
                                    {/* Column: order id */}
                                    <td className="px-4 py-4">#{order.id}</td>

                                    {/* Column: customer (avatar + name + email) */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                                                {order.user?.name
                                                    ?.charAt(0)
                                                    .toUpperCase() ?? "?"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium dark:text-gray-100">
                                                    {order.user?.name ??
                                                        "Deleted user"}
                                                </p>
                                                <p className="text-xs dark:text-gray-400">
                                                    {order.user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Column: items (max 3 pictures, then +N) */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                {order.items
                                                    .slice(0, 3)
                                                    .map((item) => (
                                                        <ProductThumb
                                                            key={item.id}
                                                            src={
                                                                item.product
                                                                    ?.image ??
                                                                null
                                                            }
                                                            name={
                                                                item.product
                                                                    ?.name ?? ""
                                                            }
                                                        />
                                                    ))}

                                                {/* "+N" box when there are more than 3 items */}
                                                {order.items.length > 3 && (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-xs font-medium dark:text-gray-300">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Total quantity of all items */}
                                            <span className="whitespace-nowrap text-sm dark:text-gray-300">
                                                {order.items.reduce(
                                                    (sum, i) => sum + i.quantity,
                                                    0,
                                                )}{" "}
                                                items
                                            </span>
                                        </div>
                                    </td>

                                    {/* Column: total price */}
                                    <td className="px-4 py-4">${order.total}</td>

                                    {/* Column: status badge */}
                                    <td className="px-4 py-4">
                                        <Badge
                                            value={order.status}
                                            styles={statusStyle}
                                        />
                                    </td>

                                    {/* Column: payment badge (null -> "unpaid") */}
                                    <td className="px-4 py-4">
                                        <Badge
                                            value={order.payment || "unpaid"}
                                            styles={paymentStyle}
                                        />
                                    </td>

                                    {/* Column: date + time */}
                                    <td className="px-4 py-4">
                                        <p className="text-sm">
                                            {formatDate(order.created_at)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatTime(order.created_at)}
                                        </p>
                                    </td>

                                    {/* Column: action menu (edit / delete / view) */}
                                    <td className="px-4 py-4">
                                        <ActionMenu
                                            // Button: Edit
                                            onEdit={() =>
                                                router.visit(
                                                    `/order/edit/${order.id}`,
                                                )
                                            }
                                            // Button: Delete (asks for confirmation first)
                                            onDelete={async () => {
                                                const ok = await confirmDelete({
                                                    title: `Delete order #${order.id}?`,
                                                    text: `This will permanently remove the order of ${order.user?.name ?? "this customer"}. This can't be undone.`,
                                                });

                                                if (!ok) return;

                                                // toast() မခေါ်တော့ဘူး
                                                router.delete(`/order/delete/${order.id}`, {
                                                    preserveScroll: true,
                                                });
                                            }}
                                            // Button: View detail
                                            onView={() =>
                                                router.visit(
                                                    `/order/show/${order.id}`,
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ===================== PAGINATION ===================== */}
                <Pagination orders={orders} />
            </div>
        </div>
    );
}
