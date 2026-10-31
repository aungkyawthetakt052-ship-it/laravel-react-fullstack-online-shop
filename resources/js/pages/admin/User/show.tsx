import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Mail, Calendar, User as UserIcon, Shield, Edit, Trash2 } from "lucide-react";
import { confirmDelete } from "@/lib/alert";

interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    role: string;
    image: string | null;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    user: User;
}

export default function Show({ user }: Props) {
    const handleDelete = async () => {
        const ok = await confirmDelete({
            title: `Delete user ${user.name}?`,
            text: "This action cannot be undone.",
            confirmText: "Yes, delete",
            cancelText: "Cancel",
        });

        if (!ok) return;

        router.delete(`/user/delete/${user.id}`, {
            onSuccess: () => router.visit("/users"),
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Head title={`${user.name} - User Details`} />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/users"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                User Details
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Viewing profile of {user.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={`/user/edit/${user.id}`}>
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

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="bg-linear-to-br from-indigo-500 to-purple-600 px-6 py-8 text-center">
                                {user.image ? (
                                    <img
                                        src={`/storage/${user.image}`}
                                        alt={user.name}
                                        className="mx-auto h-28 w-28 rounded-full border-4 border-white object-cover shadow-xl"
                                    />
                                ) : (
                                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-white/20 text-4xl font-bold text-white shadow-xl">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <h2 className="mt-4 text-xl font-bold text-white">
                                    {user.name}
                                </h2>
                                <p className="mt-1 text-indigo-100">{user.email}</p>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-center">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold ${
                                            user.role === "admin"
                                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        }`}
                                    >
                                        <Shield size={14} />
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Information */}
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Personal Information
                                </h3>
                            </div>

                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                {/* Name */}
                                <div className="flex items-center gap-4 px-6 py-5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                        <UserIcon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Full Name
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {user.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-4 px-6 py-5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Email Address
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Age */}
                                <div className="flex items-center gap-4 px-6 py-5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Age
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {user.age} years old
                                        </p>
                                    </div>
                                </div>

                                {/* Role */}
                                <div className="flex items-center gap-4 px-6 py-5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Role
                                        </p>
                                        <p className="font-medium capitalize text-gray-900 dark:text-white">
                                            {user.role}
                                        </p>
                                    </div>
                                </div>

                                {/* Created At (if available) */}
                                {user.created_at && (
                                    <div className="flex items-center gap-4 px-6 py-5">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Joined Date
                                            </p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {new Date(user.created_at).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}