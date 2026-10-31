import { Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

export default function Create() {
    return (
        <div className="p-4 md:p-6">
            {/* Header with Back button */}
            <div className="mb-6">
                <Link
                    href="/orders"
                    className="mb-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>

                <h1 className="text-2xl font-bold tracking-tight">
                    Create Order
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Create a new order for a customer
                </p>
            </div>

            {/* Your form will go here later */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-gray-500">Order create form coming soon...</p>
            </div>
        </div>
    );
}