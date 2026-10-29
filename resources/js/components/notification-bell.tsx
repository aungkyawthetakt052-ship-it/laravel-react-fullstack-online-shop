import { router, usePage } from "@inertiajs/react";
import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* =====================================================================
 *  TYPES  (HandleInertiaRequests ကနေ share လုပ်တဲ့ data ပုံစံ)
 * ===================================================================== */
interface NotificationItem {
    id: string;
    title: string;
    message: string;
    url: string;
    read: boolean;
    time: string; // "5 minutes ago" (server က ပြီးသား စာသား)
}
interface NotificationData {
    unread_count: number;
    items: NotificationItem[];
}

// နောက်ကွယ်မှာ ဘယ်နှစ်စက္ကန့်တစ်ခါ အသစ်ရှိလား မေးမလဲ
const POLL_MS = 30_000;

/* =====================================================================
 *  <NotificationBell />
 *  header ထဲမှာ <NotificationBell /> လို့ ထည့်ရုံပဲ
 * ===================================================================== */
export default function NotificationBell() {
    const { notifications } = usePage<{
        notifications: NotificationData | null;
    }>().props;

    const [open, setOpen] = useState(false);
    const box = useRef<HTMLDivElement>(null);

    // ----- အပြင်ကိုနှိပ်ရင် / Esc နှိပ်ရင် dropdown ပိတ်မယ် -----
    useEffect(() => {
        if (!open) return;

        const onClick = (e: MouseEvent) => {
            if (box.current && !box.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    // ----- ၃၀ စက္ကန့်တစ်ခါ notifications ကိုပဲ ပြန်ယူမယ် (polling) -----
    // tab ကို မကြည့်နေရင် မမေးဘူး (server ကို မပင်ပန်းစေဖို့)
    useEffect(() => {
        const timer = setInterval(() => {
            if (document.visibilityState === "visible") {
                router.reload({ only: ["notifications"] });
            }
        }, POLL_MS);

        return () => clearInterval(timer);
    }, []);

    // login မဝင်ထားရင် (data = null) ဘာမှမပြဘူး
    if (!notifications) return null;

    const { unread_count, items } = notifications;

    // item ကိုနှိပ်ရင်: server က read လုပ်ပြီး သူ့ page ကို redirect လုပ်ပေးမယ်
    const openItem = (n: NotificationItem) => {
        setOpen(false);

        // absolute URL ဖြစ်နေရင်လည်း path ပဲယူမယ်
        let target = n.url;
        try {
            const u = new URL(n.url, window.location.origin);
            target = u.pathname + u.search + u.hash;
        } catch { }

        if (n.read) {
            router.visit(target);
            return;
        }

        router.post(`/notifications/${n.id}/read`, {}, {
            preserveScroll: true,
            preserveState: true,
            only: ["notifications"],
            onFinish: () => router.visit(target),
        });
    };
    const deleteAll = () => {
        if (!confirm('Delete all notifications?')) return;

        router.post(
            '/notifications/delete-all',
            {},
            {
                preserveScroll: true,
                only: ['notifications'],
            }
        );
    };

    const markAllRead = () =>
        router.post(
            "/notifications/read-all",
            {},
            { preserveScroll: true, only: ["notifications"] },
        );

    return (
        <div ref={box} className="relative">
            {/* ----- Bell button + အနီရောင် အရေအတွက် ----- */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Notifications"
                aria-expanded={open}
                className="relative flex h-9 w-9 items-center justify-center rounded-md border border-gray-700 hover:bg-gray-800/60"
            >
                <Bell size={18} />
                {unread_count > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                        {unread_count > 99 ? "99+" : unread_count}
                    </span>
                )}
            </button>

            {/* ----- Dropdown ----- */}
            {open && (
                <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-700 bg-white shadow-xl dark:bg-gray-900">
                    {/* Header: title + "Mark all as read" */}
                    <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
                        <p className="text-sm font-semibold">Notifications</p>

                        {unread_count > 0 && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                            >
                                <CheckCheck size={14} /> Mark all as read
                            </button>
                        )}
                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={deleteAll}
                                className="text-xs text-red-400 hover:text-red-300"
                            >
                                Delete all
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                        {items.length === 0 && (
                            <p className="px-4 py-10 text-center text-sm text-gray-400">
                                No notifications yet
                            </p>
                        )}

                        {items.map((n) => (
                            <button
                                key={n.id}
                                type="button"
                                onClick={() => openItem(n)}
                                className={`flex w-full items-start gap-3 border-b border-gray-800 px-4 py-3 text-left hover:bg-gray-800/40 ${n.read ? "" : "bg-blue-500/10"
                                    }`}
                            >
                                {/* မဖတ်ရသေးရင် အပြာစက်လေး */}
                                <span
                                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-blue-500"
                                        }`}
                                />
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium">
                                        {n.title}
                                    </span>
                                    <span className="block text-xs text-gray-400">
                                        {n.message}
                                    </span>
                                    <span className="mt-1 block text-[11px] text-gray-500">
                                        {n.time}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
