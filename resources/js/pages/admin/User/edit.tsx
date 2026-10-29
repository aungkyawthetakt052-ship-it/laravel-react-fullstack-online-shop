import { Link, useForm } from "@inertiajs/react";
import { FormEvent, useState } from "react";

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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // File upload ရှိလို့ post + _method=PUT သုံးတာ ပိုစိတ်ချရတယ်
        post(`/user/update/${user.id}`, {
            forceFormData: true,
            onSuccess: () => {
                // အောင်မြင်ရင် လုပ်ချင်တာ ထည့်လို့ရတယ်
            },
        });
    };

    return (
        <div className="mx-auto max-w-2xl overflow-hidden bg-gray-700/80 rounded-sm ml-20">
            <div className="m-8">
                <h1 className="text-xl py-8">User edit page</h1>

                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <label>
                        Username <span className="text-red-500">*</span>
                    </label>
                    <div className="py-2">
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="w-120 px-4 py-3 rounded-sm text-white font-semibold border border-gray-700 bg-gray-800 focus:outline-sky-400"
                        />
                        {errors.name && (
                            <p className="text-sm text-pink-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <label>
                        Email address <span className="text-red-500">*</span>
                    </label>
                    <div className="py-2">
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="w-120 px-4 py-3 rounded-sm text-white font-semibold border border-gray-700 bg-gray-800 focus:outline-sky-400"
                        />
                        {errors.email && (
                            <p className="text-sm text-pink-500">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <label>
                        Password{" "}
                        <span className="text-gray-400 text-sm">(leave blank if no change)</span>
                    </label>
                    <div className="py-2">
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            className="w-120 px-4 py-3 rounded-sm text-white font-semibold border border-gray-700 bg-gray-800 focus:outline-sky-400"
                        />
                        {errors.password && (
                            <p className="text-sm text-pink-500">{errors.password}</p>
                        )}
                    </div>

                    {/* Age */}
                    <label>
                        Age <span className="text-red-500">*</span>
                    </label>
                    <div className="py-2">
                        <input
                            type="number"
                            value={data.age}
                            onChange={(e) => setData("age", e.target.value)}
                            className="w-120 px-4 py-3 rounded-sm text-white font-semibold border border-gray-700 bg-gray-800 focus:outline-sky-400"
                        />
                        {errors.age && (
                            <p className="text-sm text-pink-500">{errors.age}</p>
                        )}
                    </div>

                    {/* Role */}
                    <label>Role</label>
                    <div className="py-2">
                        <select
                            value={data.role}
                            onChange={(e) => setData("role", e.target.value)}
                            className="w-120 px-4 py-3 rounded-sm text-white font-semibold border border-gray-700 bg-gray-800 focus:outline-sky-400"
                        >
                            <option value="">-- Select Role --</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        {errors.role && (
                            <p className="text-sm text-pink-500">{errors.role}</p>
                        )}
                    </div>

                    {/* Current Image */}
                    {user.image && !data.image && (
                        <div className="mb-4">
                            <p className="mb-3 text-sm text-gray-400">
                                Current photo:{" "}
                                <span className="text-sm text-gray-400">Click to view</span>
                            </p>
                            <img
                                src={`/storage/${user.image}`}
                                alt={user.name}
                                onClick={() => setPreviewImage(`/storage/${user.image}`)}
                                className="w-32 h-32 rounded-lg border border-gray-700 object-cover cursor-pointer"
                            />
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="py-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData("image", e.target.files?.[0] || null)
                            }
                            className="w-120 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                        />
                        {errors.image && (
                            <p className="text-sm text-pink-500">{errors.image}</p>
                        )}
                    </div>

                    {/* New Image Preview */}
                    {data.image && (
                        <div className="mt-4">
                            <p className="mb-2 text-sm text-gray-400">
                                New Image:{" "}
                                <span className="text-sm text-gray-400">Click to view</span>
                            </p>
                            <img
                                src={URL.createObjectURL(data.image)}
                                alt="New preview"
                                onClick={() =>
                                    setPreviewImage(URL.createObjectURL(data.image as File))
                                }
                                className="h-28 w-28 cursor-pointer rounded-xl border border-gray-700 object-cover transition hover:opacity-80"
                            />
                        </div>
                    )}

                    {/* Upload Progress */}
                    {progress && (
                        <div className="mt-4">
                            <div className="mb-1 flex justify-between text-sm text-gray-400">
                                <span>Uploading......</span>
                                <span>{progress.percentage}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                                <div
                                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? "Updating..." : "Update user"}
                        </button>

                        <Link
                            href="/users"
                            className="rounded-lg border border-gray-700 px-6 py-2.5 text-sm text-gray-300 transition hover:bg-gray-800"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>

            {/* Full Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-w-[90vw] max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-3 -right-3 bg-white text-black hover:bg-red-500 hover:text-white rounded-full h-8 w-8 flex items-center justify-center"
                        >
                            ✕
                        </button>
                        <img
                            src={previewImage}
                            alt="Full Preview"
                            className="max-h-[90vh] max-w-[90vw] rounded-sm object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}