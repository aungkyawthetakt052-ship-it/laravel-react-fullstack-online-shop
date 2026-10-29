import { Link, useForm } from "@inertiajs/react";
import { FormEvent, useEffect, useState } from "react";
import { ImagePlus, X, Upload } from "lucide-react";
import FlashMessage from "@/components/flash-message";

const MAX_SIZE_MB = 2;
const MAX_FILES = 3;

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 " +
    "placeholder:text-gray-400 outline-none transition " +
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 " +
    "dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";
const errorClass = "mt-1.5 text-sm text-red-500";

export default function Create() {
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
        name: "",
        sku: "",
        category: "",
        price: "",
        stock: "",
        images: [] as File[],
    });

    const [previews, setPreviews] = useState<string[]>([]);
    const [modalImage, setModalImage] = useState<string | null>(null);

    // Preview URL ဖန်တီး + cleanup
    useEffect(() => {
        const urls = data.images.map((file) => URL.createObjectURL(file));
        setPreviews(urls);
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [data.images]);

    const imageError =
        errors.images ??
        Object.entries(errors).find(([key]) => key.startsWith("images."))?.[1];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files ?? []);
        e.target.value = ""; // same file ပြန်ရွေးလို့ရအောင်
        clearErrors("images");

        if (picked.length === 0) return;

        const tooBig = picked.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
        if (tooBig) {
            setError(
                "images",
                `"${tooBig.name}" must be smaller than ${MAX_SIZE_MB} MB.`
            );
            return;
        }

        const merged = [...data.images, ...picked];
        if (merged.length > MAX_FILES) {
            setError("images", `You can upload up to ${MAX_FILES} images only.`);
            return;
        }

        setData("images", merged);
    };

    // Remove – အလုပ်လုပ်အောင် ပြင်ထား
    const removeImage = (index: number) => {
        clearErrors("images");
        const next = data.images.filter((_, i) => i !== index);
        setData("images", next);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();

        const newErrors: Record<string, string> = {};
        if (!data.name.trim()) newErrors.name = "Name is required";
        if (!data.sku.trim()) newErrors.sku = "SKU is required";
        if (!data.category.trim()) newErrors.category = "Category is required";
        if (!data.price.trim()) newErrors.price = "Price is required";
        if (!data.stock.trim()) newErrors.stock = "Stock is required";
        if (data.images.length === 0)
            newErrors.images = "At least one image is required";

        if (Object.keys(newErrors).length > 0) {
            setError(newErrors as any);
            return;
        }

        post("/product/create", { forceFormData: true });
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
            <FlashMessage />

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Create product
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add a new product to your catalog
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
                        {errors.name && (
                            <p className={errorClass}>{errors.name}</p>
                        )}
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
                        {errors.sku && (
                            <p className={errorClass}>{errors.sku}</p>
                        )}
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
                        {errors.price && (
                            <p className={errorClass}>{errors.price}</p>
                        )}
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
                        {errors.stock && (
                            <p className={errorClass}>{errors.stock}</p>
                        )}
                    </div>

                    {/* Images */}
                    <div className="sm:col-span-2">
                        <label className={labelClass}>
                            Images ({data.images.length}/{MAX_FILES})
                        </label>

                        {/* Upload zone */}
                        <label
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 ${
                                processing || data.images.length >= MAX_FILES
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
                                PNG, JPG up to {MAX_SIZE_MB}MB · Max {MAX_FILES}{" "}
                                files
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                disabled={
                                    processing || data.images.length >= MAX_FILES
                                }
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>

                        {imageError && (
                            <p className={errorClass}>{imageError}</p>
                        )}

                        {/* Preview cards: name + KB + Remove */}
                        {data.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                {data.images.map((file, index) => (
                                    <div
                                        key={`${file.name}-${file.size}-${index}`}
                                        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        {/* Image */}
                                        <div className="relative">
                                            <img
                                                src={previews[index]}
                                                alt={file.name}
                                                onClick={() =>
                                                    setModalImage(previews[index])
                                                }
                                                className="h-28 w-full cursor-pointer object-cover"
                                            />
                                            {/* Remove button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    removeImage(index);
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
                                                title={file.name}
                                            >
                                                {file.name}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-gray-500">
                                                {formatBytes(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {processing && progress && (
                            <UploadProgress
                                percentage={progress.percentage ?? 0}
                            />
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
                        {processing ? "Creating..." : "Create product"}
                    </button>
                    <Link
                        href="/products"
                        className="inline-flex h-11 items-center rounded-xl border border-gray-300 px-6 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </Link>
                </div>
            </form>

            {/* Full image modal */}
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