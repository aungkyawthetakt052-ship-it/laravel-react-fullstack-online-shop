import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
    ArrowLeft,
    Package,
    Tag,
    Boxes,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    ImageOff,
    Edit,
    Trash2,
} from "lucide-react";
import { confirmDelete } from "@/lib/alert";

interface ProductEdit {
    id: number;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    status?: string | null;
    image: string | null;
    images?: string[];
}

interface Props {
    product: ProductEdit;
    [key: string]: any;
}

export default function Detail({ product }: Props) {
    const photos: string[] = (
        product.images && product.images.length > 0
            ? product.images
            : product.image
                ? [product.image]
                : []
    ).filter(Boolean);

    const [current, setCurrent] = useState(0);

    const prev = () =>
        setCurrent((i) => (i === 0 ? photos.length - 1 : i - 1));
    const next = () =>
        setCurrent((i) => (i === photos.length - 1 ? 0 : i + 1));

    // 1 ပုံ = 1 col, 2 ပုံ = 2 col, 3+ = 3 col
    const thumbGrid =
        photos.length <= 1
            ? "grid-cols-1"
            : photos.length === 2
                ? "grid-cols-2"
                : "grid-cols-3";

    const handleDelete = async () => {
        const ok = await confirmDelete({
            title: `Delete user ${product.name}?`,
            text: "This action cannot be undone.",
            confirmText: "Yes, delete",
            cancelText: "Cancel",
        });

        if (!ok) return;

        router.delete(`/product/delete/${product.id}`, {
            onSuccess: () => router.visit("/products"),
        });
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Link
                        href="/products"
                        className="mb-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>

                    <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
                    <p className="mt-1 text-sm text-gray-500">SKU: {product.sku}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/product/edit/${product.id}`}
                    >

                        <button className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                            <Edit size={16} />
                            Edit
                        </button>
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-500"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>

                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-5">
                {/* ========== IMAGES ========== */}
                <div className="space-y-3 lg:col-span-3">
                    {photos.length > 0 ? (
                        <>
                            {/* ကြီးတဲ့ ပုံ */}
                            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
                                <img
                                    src={`/storage/${photos[current]}`}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />

                                {photos.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={prev}
                                            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white dark:bg-gray-900/80 dark:text-white"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={next}
                                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white dark:bg-gray-900/80 dark:text-white"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
                                            {current + 1} / {photos.length}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* သေးငယ်တဲ့ thumbnails */}
                            <div className="flex flex-wrap gap-2">
                                {photos.map((photo, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => setCurrent(index)}
                                        className={`h-20 w-30 shrink-0 overflow-hidden rounded-xl border-2 transition ${index === current
                                            ? "border-blue-500 ring-2 ring-blue-500/30"
                                            : "border-transparent opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img
                                            src={`/storage/${photo}`}
                                            alt={`thumb ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex aspect-4/3 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                            <ImageOff size={32} className="mb-2 text-gray-400" />
                            <p className="text-sm text-gray-500">No image</p>
                        </div>
                    )}
                </div>

                {/* ========== INFO ========== */}
                <div className="space-y-4 lg:col-span-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900/50">
                        <h2 className="mb-5 text-lg font-semibold">Product details</h2>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                    <Tag size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Category</p>
                                    <p className="font-medium">{product.category}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                    <DollarSign size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Price</p>
                                    <p className="text-2xl font-bold text-emerald-500">
                                        ${Number(product.price).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                                    <Boxes size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Stock</p>
                                    <p className="font-medium">{product.stock} units</p>
                                </div>
                            </div>

                            {product.status && (
                                <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium">
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                        {product.status}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/30">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Package size={14} />
                            <span>
                                ID{" "}
                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                    #{product.id}
                                </span>
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            SKU{" "}
                            <span className="font-mono text-gray-700 dark:text-gray-300">
                                {product.sku}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}