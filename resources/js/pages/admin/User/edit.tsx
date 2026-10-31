import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";

interface EditUser {
    id: number;
    name: string;
    email: string;
    password?: string;
    age: number;
    role?: string | null;
    image: string | null;
}

interface PageProp {
    user: EditUser;
}

export default function Edit({ user }: PageProp) {
    const { data, setData, post, processing, errors, progress } = useForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        age: user.age?.toString() || "",
        role: user.role || "",
        image: null as File | null,
        _method: "PUT",
    });

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [thumbnail, setThumbnail] = useState<string | null>(null);

    // ပုံအသစ် preview (memory leak မဖြစ်အောင်)
    useEffect(() => {
        if (!data.image) {
            setThumbnail(null);
            return;
        }
        const url = URL.createObjectURL(data.image);
        setThumbnail(url);
        return () => URL.revokeObjectURL(url);
    }, [data.image]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/user/update/${user.id}`, {
            forceFormData: true,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Head title={`Edit ${user.name}`} />

            <div className="w-full max-w-2xl px-4 py-8 sm:px-6">
                {/* Header - create page နဲ့ ပုံစံတူ */}
                <div className="mb-8 pl-0">
                    <Link
                        href="/users"
                        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Edit User
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Update information for {user.name}
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
                                    Password{" "}
                                    <span className="text-xs text-gray-400">
                                        (leave blank to keep current)
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                                    placeholder="••••••••"
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

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Role
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

                            {/* Current Image */}
                            {user.image && !data.image && (
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Current Photo
                                    </label>
                                    <img
                                        src={`/storage/${user.image}`}
                                        alt={user.name}
                                        onClick={() => setPreviewImage(`/storage/${user.image}`)}
                                        className="h-28 w-28 cursor-pointer rounded-xl object-cover shadow-sm transition hover:opacity-80"
                                    />
                                </div>
                            )}

                            {/* Image Upload */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Profile Photo
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10">
                                        <Upload size={18} />
                                        Choose Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) =>
                                                setData("image", e.target.files?.[0] || null)
                                            }
                                        />
                                    </label>
                                    {data.image && (
                                        <span className="truncate text-sm text-gray-500 dark:text-gray-400">
                                            {data.image.name}
                                        </span>
                                    )}
                                </div>
                                {errors.image && (
                                    <p className="mt-1.5 text-sm text-red-500">{errors.image}</p>
                                )}
                            </div>

                            {/* New Image Preview */}
                            {data.image && thumbnail && (
                                <div>
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        New Photo Preview
                                    </p>
                                    <img
                                        src={thumbnail}
                                        alt="Preview"
                                        onClick={() => setPreviewImage(thumbnail)}
                                        className="h-28 w-28 cursor-pointer rounded-xl object-cover shadow-sm"
                                    />
                                </div>
                            )}

                            {/* Progress */}
                            {progress && (
                                <div>
                                    <div className="mb-1 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Uploading...</span>
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
                                {processing ? "Updating..." : "Update User"}
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

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition hover:bg-red-500 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}