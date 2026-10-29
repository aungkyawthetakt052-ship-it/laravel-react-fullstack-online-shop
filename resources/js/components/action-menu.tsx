import { EllipsisVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Prop = {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function ActionMenu({ onEdit, onDelete, onView }: Prop) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    /** click outside to close */
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    /** press Esc to close */
    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handleKeyboard);
        return () => document.removeEventListener("keydown", handleKeyboard);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={ref}>
            {/* Vertical dots button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-label="Actions"
                aria-expanded={open}
                className="ml-3 rounded-full px-2 py-1 text-gray-600 hover:bg-gray-100 dark:bg-transparent dark:text-white dark:hover:bg-gray-600"
            >
                <EllipsisVertical />
            </button>

            {/* Menu items */}
            {open && (
                <div className="absolute right-0 z-50 mt-1 w-36 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onView();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Eye size={16} />
                        View
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onEdit();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Pencil size={16} />
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}