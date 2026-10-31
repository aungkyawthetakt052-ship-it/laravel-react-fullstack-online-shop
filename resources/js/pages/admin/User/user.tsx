import FlashMessage from "@/components/flash-message";
import { Link, router, usePage } from "@inertiajs/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Search, X, Plus, Users } from "lucide-react";
import ActionMenu from "@/components/action-menu";
import { confirmDelete } from "@/lib/alert";

interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    role: string;
    image: string | null;
}

interface PageProp {
    users: User[];
    search?: string;
    [key: string]: any;
}

const handleDelete = async (user: { id: number; name: string }) => {
    const ok = await confirmDelete({
        title: `Delete user ${user.name}?`,
        text: "This action can't be undone.",
        confirmText: "Yes, delete",
        cancelText: "Cancel",
    });

    if (!ok) return;

    router.delete(`/user/delete/${user.id}`, {
        preserveScroll: true,
    });
};

export default function User() {
    const { users = [], search } = usePage<PageProp>().props;
    const [filter, setFilter] = useState(search ?? "");
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const firstRef = useRef(true);
    useEffect(() => {
        if (firstRef.current) {
            firstRef.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(
                "/users",
                { search: filter },
                {
                    preserveState: true,
                    replace: true,
                    only: ["users", "search", "flash"],
                }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [filter]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                            <Users size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Customers Management
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage your users and their information
                            </p>
                        </div>
                    </div>

                    <Link href="/user/create">
                        <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 hover:shadow-indigo-500/40">
                            <Plus size={18} />
                            Create User
                        </button>
                    </Link>
                </div>

                <FlashMessage />

                {/* Search + Results bar */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-11 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-500"
                        />
                        {filter && (
                            <button
                                onClick={() => setFilter("")}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {search && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Found{" "}
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {users.length}
                            </span>{" "}
                            result{users.length !== 1 && "s"} for "
                            <span className="font-medium">{search}</span>"
                        </p>
                    )}
                </div>

                {/* Table Card */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/60">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Age
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Image
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {users.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Users className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {search
                                                        ? `No users found for "${search}"`
                                                        : "No users found"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                #{user.id}
                                            </td>

                                            {/* Name + Avatar */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-md">
                                                        {user.name
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {user.name}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {user.email}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {user.age}
                                            </td>

                                            {/* Role Badge */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                        user.role === "admin"
                                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                                                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                    }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>

                                            {/* Image */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {user.image ? (
                                                    <img
                                                        src={`/storage/${user.image}`}
                                                        alt={user.name}
                                                        onClick={() =>
                                                            setPreviewImage(
                                                                `/storage/${user.image}`
                                                            )
                                                        }
                                                        className="h-11 w-16 cursor-pointer rounded-lg object-cover shadow-sm transition hover:opacity-80 hover:ring-2 hover:ring-indigo-500"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-400 dark:text-gray-500">
                                                        No image
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <ActionMenu
                                                    onView={() =>
                                                        router.visit(
                                                            `/user/${user.id}`
                                                        )
                                                    }
                                                    onEdit={() =>
                                                        router.visit(
                                                            `/user/edit/${user.id}`
                                                        )
                                                    }
                                                    onDelete={() =>
                                                        handleDelete(user)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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