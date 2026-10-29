


import { router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

type FlashType = "success" | "delete" | "error";

// အရောင်နဲ့ icon ကို ဒီနေရာတစ်ခုတည်းမှာ ပြင်လို့ရတယ်
const STYLES: Record<FlashType, { bg: string; icon: string }> = {
    success: { bg: "bg-green-600", icon: "✓" },
    delete: { bg: "bg-red-600", icon: "🗑" },
    error:   { bg: "bg-rose-800", icon: "!" },
};

export default function FlashMessage() {
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState("");
    const [type, setType] = useState<FlashType>("success");
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const remove = router.on("success", (event) => {
            const f = (event.detail.page.props as any).flash;

            // ဘယ် key ရှိလဲ အစဉ်လိုက်စစ်
            const found = (["delete", "error", "success"] as FlashType[]).find(
                (key) => f?.[key]
            );
            if (!found) return;

            setText(f[found]);
            setType(found);
            setVisible(true);

            // အရင် timer ရှိရင် ရှင်းပြီး အသစ်စ
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setVisible(false), 3000);
        });

        return () => {
            remove();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (!visible) return null;

    const { bg, icon } = STYLES[type];

    return (
        <div
            role="alert"
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-md px-4 py-3 text-sm text-white shadow-lg ${bg}`}
        >
            <span className="text-base">{icon}</span>
            <span>{text}</span>
            <button
                onClick={() => setVisible(false)}
                className="ml-2 text-lg leading-none hover:opacity-70"
                aria-label="Close"
            >
                &times;
            </button>
        </div>
    );
}





















