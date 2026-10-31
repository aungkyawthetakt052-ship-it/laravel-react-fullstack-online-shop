import ShopLayout from "@/layouts/shop-layout";
import { Head, Link } from "@inertiajs/react";

interface Props {
    message: string;
}

export default function Success({ message }: Props) {
    return (
        <ShopLayout>
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-12 transition-colors duration-300 dark:bg-gray-950">
            <Head title="Payment Successful" />

            {/* Soft ambient glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-28rem w-28rem rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-600/15" />
                <div className="absolute -bottom-40 -right-40 h-28rem w-28rem rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-600/15" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/40">
                    
                    {/* Top gradient accent */}
                    <div className="h-1.5 w-full bg-linear-to-r from-emerald-400 via-green-500 to-teal-500" />

                    <div className="px-8 pb-10 pt-10 text-center sm:px-10">
                        {/* Success Icon */}
                        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center">
                            <div className="relative">
                                {/* Pulse ring */}
                                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40 dark:bg-emerald-500/30" />
                                
                                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/40">
                                    <svg
                                        className="h-10 w-10 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            Payment Successful!
                        </h1>

                        {/* Message */}
                        <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                            {message}
                        </p>

                        {/* Divider */}
                        <div className="my-8 h-px w-full bg-linear-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />

                        {/* Button */}
                        <Link
                            href="/"
                            className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        >
                            <span className="relative z-10">Back to Home</span>
                            {/* Shine effect */}
                            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        </Link>
                    </div>
                </div>

                {/* Footer text */}
                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    A confirmation has been sent to your email.
                </p>
            </div>
        </div>
        </ShopLayout>
    );
}