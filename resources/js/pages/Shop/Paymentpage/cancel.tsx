import { Head, Link } from "@inertiajs/react";

export default function Cancel() {
    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <Head title="Payment Cancelled" />

            <div className="text-center">
                <h1 className="text-2xl font-bold">
                    Payment Cancelled
                </h1>

                <p className="mt-3 text-gray-600">
                    Your payment was not completed.
                </p>

                <Link
                    href="/"
                    className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-3 text-white"
                >
                    Back to Shop
                </Link>
            </div>
        </div>
    );
}