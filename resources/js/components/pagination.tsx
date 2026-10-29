
import { Link } from "@inertiajs/react";

/* =====================================================================
 *  Laravel paginate() က ပို့တဲ့ data ပုံစံ
 * ===================================================================== */
export interface PageLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PageLink[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
}

// Laravel က "&laquo; Previous" / "Next &raquo;" လို့ ပို့လို့ ဖတ်လို့လွယ်အောင် ပြောင်းတယ်
const pageLabel = (label: string) =>
    label.replace("&laquo; Previous", "Prev").replace("Next &raquo;", "Next");

/* =====================================================================
 *  <Pagination />  → Prev | 1 2 3 ... | Next
 *
 *  paginator : controller က ပို့တဲ့ paginate() ရလဒ်
 *  only      : page ကူးတဲ့အခါ ပြန် load မယ့် prop နာမည်များ
 *              (stats လို မပြောင်းတာတွေကို ထပ်မ load အောင်)
 *  label     : "products" / "orders" စသည် (Showing 1–20 of 57 products)
 * ===================================================================== */
export default function Pagination<T>({
    paginator,
    only,
    label = "items",
}: {
    paginator: Paginated<T>;
    only?: string[];
    label?: string;
}) {
    // page တစ်ခုတည်းဆိုရင် ဘာမှမပြဘူး
    if (paginator.last_page <= 1) return null;

    const base =
        "flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm transition";

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-700 p-4">
            <p className="text-sm text-gray-400">
                Showing {paginator.from ?? 0}–{paginator.to ?? 0} of{" "}
                {paginator.total} {label}
            </p>

            <nav className="flex flex-wrap items-center gap-1">
                {paginator.links.map((link, i) => {
                    const text = pageLabel(link.label);

                    // url မရှိ = နှိပ်လို့မရ (page 1 မှာ Prev၊ "..." စတာတွေ)
                    if (!link.url) {
                        return (
                            <span
                                key={i}
                                className={`${base} cursor-not-allowed border-gray-800 text-gray-600`}
                            >
                                {text}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={i}
                            href={link.url}
                            preserveState
                            preserveScroll
                            only={only}
                            className={`${base} ${
                                link.active
                                    ? "border-blue-500 bg-blue-600 text-white"
                                    : "border-gray-700 text-gray-300 hover:bg-gray-800"
                            }`}
                        >
                            {text}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
