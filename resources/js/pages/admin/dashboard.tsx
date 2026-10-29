import { Head, Link } from '@inertiajs/react';
import ChangeTheme from '@/components/change-theme';
import {
    Users,
    ShoppingBag,
    Package,
    ArrowUpRight,
    TrendingUp,
    Plus,
} from 'lucide-react';
import NotificationBell from '@/components/notification-bell';

interface User {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    userCount: number;
    orderCount: number;
    productCount: number;
    users: User[];
}

export default function Dashboard({
    userCount,
    orderCount,
    productCount,
    users,
}: PageProps) {
    const cards = [
        {
            title: 'Customers',
            value: userCount,
            href: '/users',
            icon: Users,
            bg: 'bg-blue-50 dark:bg-blue-950/40',
            iconBg: 'bg-blue-100 dark:bg-blue-900/50',
            iconColor: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-100 dark:border-blue-900/50',
        },
        {
            title: 'Orders',
            value: orderCount,
            href: '/orders',
            icon: ShoppingBag,
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-100 dark:border-emerald-900/50',
        },
        {
            title: 'Products',
            value: productCount,
            href: '/products',
            icon: Package,
            bg: 'bg-violet-50 dark:bg-violet-950/40',
            iconBg: 'bg-violet-100 dark:bg-violet-900/50',
            iconColor: 'text-violet-600 dark:text-violet-400',
            border: 'border-violet-100 dark:border-violet-900/50',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-full space-y-8 bg-gray-50 p-4 text-gray-900 dark:bg-gray-950 dark:text-gray-100 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Here's what's happening in your store today
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                          <NotificationBell/>
                        <button
                            type="button"
                            className="inline-flex h-9 items-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Last 7 days
                        </button>

                        <ChangeTheme />
                      
                        

                        <Link
                            href="/product/create"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Add product
                        </Link>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={card.title}
                                href={card.href}
                                className={`group rounded-2xl border ${card.border} ${card.bg} p-6 transition hover:shadow-md`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {card.title}
                                        </p>
                                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                            {Number(card.value).toLocaleString()}
                                        </p>
                                    </div>

                                    <div
                                        className={`rounded-xl p-2.5 ${card.iconBg} ${card.iconColor}`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-500 transition group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-gray-200">
                                    View all
                                    <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom grid */}
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Recent users */}
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:col-span-3">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">
                                    Recent Customers
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Latest registered accounts
                                </p>
                            </div>
                            <Link
                                href="/users"
                                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {users.length === 0 ? (
                                <p className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No users yet.
                                </p>
                            ) : (
                                users.map((user, index) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                                                {user.name}
                                            </p>
                                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </p>
                                        </div>
                                        <span className="hidden text-xs text-gray-400 sm:inline">
                                            #{index + 1}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                            <h2 className="font-semibold text-gray-900 dark:text-white">
                                Quick Actions
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Common tasks
                            </p>
                        </div>

                        <div className="space-y-2 p-4">
                            <Link
                                href="/product/create"
                                className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                                    <Package className="h-4 w-4" />
                                </div>
                                Add new product
                            </Link>

                            <Link
                                href="/orders"
                                className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                                    <ShoppingBag className="h-4 w-4" />
                                </div>
                                Manage orders
                            </Link>

                            <Link
                                href="/users"
                                className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                    <Users className="h-4 w-4" />
                                </div>
                                View customers
                            </Link>

                            <Link
                                href="/chart"
                                className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                View analytics
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        // {
        //     title: 'Dashboard',
        //     href: dashboard(),
        // },
    ],
};