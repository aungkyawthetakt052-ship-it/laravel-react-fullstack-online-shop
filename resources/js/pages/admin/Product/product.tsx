import CustomDropDownMenu from "@/components/custom-dropdown-menu";
import ActionMenu from "@/components/action-menu";
import FlashMessage from "@/components/flash-message";
import { Link, router, usePage } from "@inertiajs/react";
import { Search, X, Package, AlertTriangle, DollarSign, ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import Pagination, { Paginated } from "@/components/pagination";
import { confirmDelete } from "@/lib/alert";

interface Products {
    id: number;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number | null;
    status: string | null;
    image?: string;
}

interface Stats {
    total: number;
    outOfStock: number;
    lowStock: number;
    inventoryValue: number;
}

interface PageProp {
    products: Paginated<Products>;
    stats: Stats;
    search?: string;
    field?: string;
    [key: string]: any;
}

const PARTIAL_PROPS = ["products", "search", "field", "flash"];

const statusStyle: Record<string, string> = {
    Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
    "Out of stock": "bg-red-500/15 text-red-400 border-red-500/40",
    "Low stock": "bg-amber-500/15 text-amber-400 border-amber-500/40",
};

export default function Product() {
    const { products, stats, search, field: serverField } = usePage<PageProp>().props;

    const [filter, setFilter] = useState(search ?? "");
    const [field, setField] = useState(serverField ?? "all");
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleDelete = async (product: { id: number; name: string }) => {
        const ok = await confirmDelete({
            title: `Delete product "${product.name}"?`,
            text: "This will permanently remove the product.",
        });
        if (!ok) return;
        router.delete(`/product/delete/${product.id}`, { preserveScroll: true });
    };

    useEffect(() => {
        const unchanged = filter === (search ?? "") && field === (serverField ?? "all");
        if (unchanged) return;

        const timer = setTimeout(() => {
            router.get(
                "/products",
                { ...(filter && { search: filter }), field },
                { preserveState: true, preserveScroll: true, replace: true, only: PARTIAL_PROPS }
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [filter, field]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPreviewImage(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div className="space-y-6 p-4 md:p-6">
            <FlashMessage />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Products</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your catalog, pricing and inventory
                    </p>
                </div>
                <Link
                    href="/product/create"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
                >
                    + Add product
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                        <Package size={22} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total products</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                        <AlertTriangle size={22} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Out of stock</p>
                        <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                        <AlertTriangle size={22} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Low stock</p>
                        <p className="text-2xl font-bold text-amber-400">{stats.lowStock}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                        <DollarSign size={22} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Inventory value</p>
                        <p className="text-2xl font-bold text-emerald-400">
                            ${stats.inventoryValue.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Table card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4 dark:border-gray-800">
                    <div className="relative w-full max-w-xs">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Search products..."
                            className="h-10 w-full rounded-xl border border-gray-300 bg-transparent pl-9 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700"
                        />
                        {filter && (
                            <button
                                type="button"
                                onClick={() => setFilter("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <CustomDropDownMenu onChange={(value) => setField(value)} />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium">Image</th>
                                <th className="px-4 py-3 font-medium">SKU</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Stock</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {products.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-500">
                                        No products found
                                        {filter && (
                                            <button
                                                type="button"
                                                onClick={() => setFilter("")}
                                                className="mt-3 block mx-auto rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                                    >
                                        <td className="px-4 py-3.5 font-medium">{product.name}</td>
                                        <td className="px-4 py-3.5">
                                            {product.image ? (
                                                <img
                                                    src={`/storage/${product.image}`}
                                                    alt={product.name}
                                                    loading="lazy"
                                                    onClick={() => setPreviewImage(`/storage/${product.image}`)}
                                                    className="h-12 w-16 cursor-pointer rounded-lg object-cover ring-1 ring-gray-200 transition hover:opacity-80 dark:ring-gray-700"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                                    <ImageOff size={16} className="text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{product.sku}</td>
                                        <td className="px-4 py-3.5 text-sm">{product.category}</td>
                                        <td className="px-4 py-3.5 font-medium">${product.price}</td>
                                        <td className="px-4 py-3.5">{product.stock ?? 0}</td>
                                        <td className="px-4 py-3.5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle[product.status ?? ""] ??
                                                    "bg-gray-500/15 text-gray-400 border-gray-500/40"
                                                    }`}
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                {product.status ?? "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <ActionMenu
                                                onView={() => router.visit(`/product/detail/${product.id}`)}
                                                onEdit={() => router.visit(`/product/edit/${product.id}`)}
                                                onDelete={() => handleDelete(product)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination paginator={products} only={PARTIAL_PROPS} label="products" />
            </div>

            {/* Image preview */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow hover:bg-red-500 hover:text-white"
                        >
                            ✕
                        </button>
                        <img src={previewImage} alt="Preview" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
}