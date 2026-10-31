import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";

const MAX_SIZE_MB = 2;

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Create() {
    const { data, setData, post, processing, progress, errors, setError, clearErrors } = useForm({
        name: "",
        email: "",
        password: "",
        age: "",
        role: "",
        image: null as File | null,
    });

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!data.image) {
            setThumbnail(null);
            return;
        }
        const url = URL.createObjectURL(data.image);
        setThumbnail(url);
        return () => URL.revokeObjectURL(url);
    }, [data.image]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        clearErrors("image");

        if (file && file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError("image", `Image must be smaller than ${MAX_SIZE_MB} MB.`);
            e.target.value = "";
            setData("image", null);
            return;
        }
        setData("image", file);
    };

    const removeImage = () => {
        setData("image", null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();

        const newErrors: Partial<Record<"name" | "email" | "password" | "age" | "role", string>> = {};

        if (!data.name.trim()) newErrors.name = "Name is required.";
        if (!data.email.trim()) newErrors.email = "Email is required.";
        if (!data.password) newErrors.password = "Password is required.";
        else if (data.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
        if (!data.age) newErrors.age = "Age is required.";
        if (!data.role) newErrors.role = "Role is required.";

        if (Object.keys(newErrors).length > 0) {
            setError(newErrors);
            return;
        }

        post("/user/create", { forceFormData: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Head title="Create User" />

           <div className="w-full max-w-2xl px-4 py-8 sm:px-6">
                {/* Header - starts from left */}
                <div className="mb-8 pl-0">
                    <Link
                        href="/users"
                        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Create New User
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Add a new user to the system
                    </p>
                </div>

                {/* Form Card */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                                    placeholder="Enter full name"
                                />
                                {errors.name && (
                                    <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                                    placeholder="name@example.com"
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                                    placeholder="Minimum 8 characters"
                                />
                                {errors.password && (
                                    <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>

                            {/* Age + Role */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Age <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.age}
                                        onChange={(e) => setData("age", e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                                        placeholder="25"
                                    />
                                    {errors.age && (
                                        <p className="mt-1.5 text-sm text-red-500">{errors.age}</p>
                                    )}
                                </div>

                                {/* Role Select - Modern Style */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={data.role}
                                            onChange={(e) => setData("role", e.target.value)}
                                            className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                                        >
                                            <option value="">Select role</option>
                                            <option value="admin">Admin</option>
                                            <option value="user">User</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg
                                                className="h-4 w-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.role && (
                                        <p className="mt-1.5 text-sm text-red-500">{errors.role}</p>
                                    )}
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Profile Photo
                                </label>

                                {!data.image ? (
                                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10">
                                        <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                            Click to upload photo
                                        </span>
                                        <span className="mt-1 text-xs text-gray-400">
                                            PNG, JPG, WEBP up to {MAX_SIZE_MB}MB
                                        </span>
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            disabled={processing}
                                        />
                                    </label>
                                ) : (
                                    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                                        <img
                                            src={thumbnail!}
                                            alt="Preview"
                                            onClick={() => setShowModal(true)}
                                            className="h-20 w-20 cursor-pointer rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {data.image.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatBytes(data.image.size)}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                disabled={processing}
                                                className="mt-1 text-xs font-medium text-red-500 hover:text-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {errors.image && (
                                    <p className="mt-1.5 text-sm text-red-500">{errors.image}</p>
                                )}
                            </div>

                            {/* Progress */}
                            {processing && progress && (
                                <div>
                                    <div className="mb-1 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Uploading {data.image?.name}...</span>
                                        <span>{progress.percentage}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex items-center gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
                            >
                                {processing ? "Creating..." : "Create User"}
                            </button>
                            <Link
                                href="/users"
                                className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Full Image Modal */}
            {showModal && thumbnail && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition hover:bg-red-500 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                        <img
                            src={thumbnail}
                            alt="Full Preview"
                            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}