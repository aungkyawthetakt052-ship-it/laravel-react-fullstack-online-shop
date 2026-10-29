import { Link, useForm } from "@inertiajs/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, X, Upload } from "lucide-react";
import FlashMessage from "@/components/flash-message";

const MAX_SIZE_MB = 2;
const MAX_FILES = 3;

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ImageItem =
    | { kind: "old"; key: string; src: string; path: string; name: string }
    | { kind: "new"; key: string; src: string; index: number; size: number; name: string };

interface ProductEdit {
    id: number;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    status?: string;
    image: string | null;
    images: string[];
}

interface Props {
    product: ProductEdit;
    [key: string]: any;
}

const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 " +
    "placeholder:text-gray-400 outline-none transition " +
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 " +
    "dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";
const errorClass = "mt-1.5 text-sm text-red-500";

const UploadProgress = ({ percentage }: { percentage: number }) => {
    const done = percentage >= 100;
    return (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
            <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                    {done ? "Processing..." : "Uploading images..."}
                </span>
                <span className="font-semibold text-blue-500">{percentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${
                        done ? "bg-emerald-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default function Edit({ product }: Props) {
    const {
        data,
        setData,
        post,
        errors,
        processing,
        progress,
        setError,
        clearErrors,
    } = useForm({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        images: [] as File[],
        remove_images: [] as string[],
        _method: "put",
    });

    const [modalImage, setModalImage] = useState<string | null>(null);

    // ပုံဟောင်း (ဖျက်မယ့်စာရင်း မပါ)
    const currentImages = (
        product.images?.length > 0
            ? product.images
            : product.image
              ? [product.image]
              : []
    ).filter((p) => !data.remove_images.includes(p));

    const totalCount = currentImages.length + data.images.length;

    // ပုံအသစ် preview
    const previews = useMemo(
        () => data.images.map((file) => URL.createObjectURL(file)),
        [data.images]
    );

    useEffect(() => {
        return () => previews.forEach((url) => URL.revokeObjectURL(url));
    }, [previews]);

    // ပုံဟောင်း + ပုံအသစ် list
    const items: ImageItem[] = [
        ...currentImages.map((path): ImageItem => ({
            kind: "old",
            key: `old-${path}`,
            src: `/storage/${path}`,
            path,
            name: path.split("/").pop() || path,
        })),
        ...previews.map((url, index): ImageItem => ({
            kind: "new",
            key: `new-${index}-${data.images[index].name}-${data.images[index].size}`,
            src: url,
            index,
            size: data.images[index].size,
            name: data.images[index].name,
        })),
    ];

    const imageError =
        errors.images ??
        Object.entries(errors).find(([key]) => key.startsWith("images."))?.[1];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files ?? []);
        e.target.value = "";
        clearErrors("images");
        if (picked.length === 0) return;

        const tooBig = picked.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
        if (tooBig) {
            setError("images", `"${tooBig.name}" must be smaller than ${MAX_SIZE_MB} MB.`);
            return;
        }

        const merged = [...data.images, ...picked];
        if (currentImages.length + merged.length > MAX_FILES) {
            setError("images", `You can have up to ${MAX_FILES} images in total.`);
            return;
        }
        setData("images", merged);
    };

    const removeOldImage = (path: string) => {
        clearErrors("images");
        setData("remove_images", [...data.remove_images, path]);
    };

    const removeNewImage = (index: number) => {
        clearErrors("images");
        setData(
            "images",
            data.images.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/product/update/${product.id}`, { forceFormData: true });
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
            <FlashMessage />

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Edit product
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Update product details and images
                </p>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 md:p-8"
            >
                <div className="grid gap-5 sm:grid-cols-2">
                    {/* Name */}
                    <div className="sm:col-span-2">
                        <label className={labelClass}>Product name</label>
                        <input
                            type="text"
                            placeholder="Enter product name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className={inputClass}
                        />
                        {errors.name && <p className={errorClass}>{errors.name}</p>}
                    </div>

                    {/* SKU */}
                    <div>
                        <label className={labelClass}>SKU</label>
                        <input
                            type="text"
                            placeholder="e.g. LP-200"
                            value={data.sku}
                            onChange={(e) => setData("sku", e.target.value)}
                            className={inputClass}
                        />
                        {errors.sku && <p className={errorClass}>{errors.sku}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className={labelClass}>Category</label>
                        <input
                            type="text"
                            placeholder="Category"
                            value={data.category}
                            onChange={(e) => setData("category", e.target.value)}
                            className={inputClass}
                        />
                        {errors.category && (
                            <p className={errorClass}>{errors.category}</p>
                        )}
                    </div>

                    {/* Price */}
                    <div>
                        <label className={labelClass}>Price</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={data.price}
                            onChange={(e) => setData("price", e.target.value)}
                            className={inputClass}
                        />
                        {errors.price && <p className={errorClass}>{errors.price}</p>}
                    </div>

                    {/* Stock */}
                    <div>
                        <label className={labelClass}>Stock</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={data.stock}
                            onChange={(e) => setData("stock", e.target.value)}
                            className={inputClass}
                        />
                        {errors.stock && <p className={errorClass}>{errors.stock}</p>}
                    </div>

                    {/* Images */}
                    <div className="sm:col-span-2">
                        <label className={labelClass}>
                            Images ({totalCount}/{MAX_FILES})
                        </label>

                        {/* Upload zone */}
                        <label
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 ${
                                processing || totalCount >= MAX_FILES
                                    ? "pointer-events-none opacity-50"
                                    : ""
                            }`}
                        >
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                                <ImagePlus size={22} />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Click to upload images
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                PNG, JPG up to {MAX_SIZE_MB}MB · Max {MAX_FILES} files
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                disabled={processing || totalCount >= MAX_FILES}
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>

                        {totalCount >= MAX_FILES && (
                            <p className="mt-2 text-sm text-amber-500">
                                Maximum {MAX_FILES} images reached. Remove one to add another.
                            </p>
                        )}
                        {imageError && <p className={errorClass}>{imageError}</p>}

                        {/* Preview cards */}
                        {items.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                {items.map((item) => (
                                    <div
                                        key={item.key}
                                        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        {/* Image */}
                                        <div className="relative">
                                            <img
                                                src={item.src}
                                                alt={item.name}
                                                onClick={() => setModalImage(item.src)}
                                                className="h-28 w-full cursor-pointer object-cover"
                                            />

                                            {/* New badge */}
                                            {item.kind === "new" && (
                                                <span className="absolute left-2 top-2 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                                    New
                                                </span>
                                            )}

                                            {/* Remove */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (item.kind === "old") {
                                                        removeOldImage(item.path);
                                                    } else {
                                                        removeNewImage(item.index);
                                                    }
                                                }}
                                                disabled={processing}
                                                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow transition hover:bg-red-500 disabled:opacity-50"
                                                title="Remove"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        {/* Name + size */}
                                        <div className="p-2.5">
                                            <p
                                                className="truncate text-xs font-medium text-gray-800 dark:text-gray-200"
                                                title={item.name}
                                            >
                                                {item.name}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-gray-500">
                                                {item.kind === "new"
                                                    ? formatBytes(item.size)
                                                    : "Existing"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {processing && progress && data.images.length > 0 && (
                            <UploadProgress percentage={progress.percentage ?? 0} />
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
                    >
                        <Upload size={16} />
                        {processing ? "Updating..." : "Update product"}
                    </button>
                    <Link
                        href="/products"
                        className="inline-flex h-11 items-center rounded-xl border border-gray-300 px-6 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </Link>
                </div>
            </form>

            {/* Lightbox */}
            {modalImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setModalImage(null)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setModalImage(null)}
                            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow hover:bg-red-500 hover:text-white"
                        >
                            ✕
                        </button>
                        <img
                            src={modalImage}
                            alt="Preview"
                            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}