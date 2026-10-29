



import { Link, useForm } from "@inertiajs/react";
import React, { FormEvent, useEffect, useRef, useState } from "react";

const MAX_SIZE_MB = 2;

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ---------- Progress Bar Component ---------- */
function UploadProgress({ percentage, fileName }: { percentage: number; fileName?: string }) {
    const done = percentage >= 100;

    return (
        <div className="mt-3 rounded-md border border-gray-700 bg-gray-800/60 p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs text-gray-300">
                <span className="max-w-[70%] truncate">
                    {done ? "Processing..." : `Uploading ${fileName ?? ""}`}
                </span>
                <span className="font-semibold text-sky-300">{percentage}%</span>
            </div>

            <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
                className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${done ? "bg-green-500 animate-pulse" : "bg-blue-500"
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default function Create() {
    const { data, setData, post, processing, progress, errors, setError, clearErrors } = useForm({
        name: "",
        email: "",
        password: "",
        age: "",
        role: '',
        image: null as File | null,
    });

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    /* URL ကို တစ်ခါပဲ ဖန်တီးပြီး cleanup လုပ်မယ် (memory leak မဖြစ်စေရန်) */
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

    // const handleSubmit = (e: FormEvent) => {
    //     e.preventDefault();
    //     post("/user/create", { forceFormData: true });
    // };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();

        // Client-side validation
        const newErrors: Partial<Record<"name" | "email" | "password" | "age", string>> = {};

        if (!data.name.trim()) newErrors.name = "Name is required.";
        if (!data.email.trim()) newErrors.email = "Email is required.";
        if (!data.password) newErrors.password = "Password is required.";
        else if (data.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
        if (!data.age) newErrors.age = "Age is required.";

        if (Object.keys(newErrors).length > 0) {
            setError(newErrors); // error တွေ ပြမယ်၊ post() မခေါ်တော့ဘူး
            return;
        }

        post("/user/create", { forceFormData: true });
    };

    const inputClass =
  "w-100 bg-gray-800 py-3 px-3 focus:outline-sky-500 rounded-sm border border-gray-700 text-white";



    return (
        <div className="w-[40%] bg-gray-600 text-sky-200/50 rounded-md ml-20 mt-10">
            <h1 className="p-8 text-xl">User Create Form</h1>

            <div className="ml-8 w-full">
                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <label>User name <span className="text-red-500">*</span></label>
                    <div className="mb-3">
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Enter your name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-pink-500">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <label>Email <span className="text-red-500">*</span></label>
                    <div className="mb-3">
                        <input
                            type="email"
                            className={inputClass}
                            placeholder="example@gmail.com"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        {errors.email && <p className="text-sm text-pink-500">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <label>Password <span className="text-red-500">*</span></label>
                    <div className="mb-3">
                        <input
                            type="password"
                            className={inputClass}
                            placeholder="Min 8 character"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                        />
                        {errors.password && <p className="text-sm text-pink-500">{errors.password}</p>}
                    </div>

                    {/* Age */}
                    <label>Age <span className="text-red-500">*</span></label>
                    <div className="mb-3">
                        <input
                            type="number"
                            className={inputClass}
                            placeholder="Enter your age"
                            value={data.age}
                            onChange={(e) => setData("age", e.target.value)}
                        />
                        {errors.age && <p className="text-sm text-pink-500">{errors.age}</p>}
                    </div>

                    {/* Role */}
                    <label>
                        Role <span className="text-red-500">*</span>
                    </label>
                    <div className="mb-3">
                        <select
                            className={inputClass}
                            value={data.role}
                            onChange={(e) => setData("role", e.target.value)}
                        >
                            <option value="">Select role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        {errors.role && (
                            <p className="text-sm text-pink-500">{errors.role}</p>
                        )}
                    </div>

                    {/* Image Preview */}
                    {thumbnail && data.image && (
                        <div className="mt-4 flex items-center gap-4">
                            <img
                                src={thumbnail}
                                alt={data.name || "preview"}
                                onClick={() => setShowModal(true)}
                                className="h-28 w-28 cursor-pointer rounded-xl border border-gray-700 object-cover transition hover:opacity-80"
                            />
                            <div className="text-sm text-gray-300">
                                <p className="max-w-50 truncate">{data.image.name}</p>
                                <p className="text-xs text-gray-400">{formatBytes(data.image.size)}</p>
                                <p className="text-xs text-gray-400">Click image to view</p>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    disabled={processing}
                                    className="mt-1 text-xs text-pink-400 hover:text-pink-300 disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}

                    {/* File Input */}
                    <div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={processing}
                            className="file:bg-blue-500 file:rounded-sm file:text-white file:px-3 file:py-1.5
                                bg-gray-800 w-100 rounded-md file:border file:m-3 file:border-gray-700
                                hover:file:bg-blue-600 disabled:opacity-50"
                        />
                        {errors.image && <p className="text-sm text-pink-500">{errors.image}</p>}
                    </div>

                    {/* Progress bar: upload လုပ်နေတုန်းသာ ပြမယ် */}
                    {processing && progress && (
                        <UploadProgress
                            percentage={progress.percentage ?? 0}
                            fileName={data.image?.name}
                        />
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-3 mb-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? "Creating..." : "Create"}
                        </button>

                        <Link
                            href="/users"
                            className="rounded-lg border border-gray-700 px-6 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>

            {/* Full-size modal */}
            {showModal && thumbnail && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white  hover:bg-red-500 hover:text-white text-black"
                            onClick={() => setShowModal(false)}
                        >
                            &times;
                        </button>
                        <img
                            src={thumbnail}
                            alt="Full Preview"
                            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}