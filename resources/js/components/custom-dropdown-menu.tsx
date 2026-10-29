import { useEffect, useRef, useState } from 'react';

const options = [
    { value: 'all', label: 'All field' },
    { value: 'name', label: 'Product name' },
    { value: 'category', label: 'Category' },
    { value: 'sku', label: 'SKU' },
];

type Props = {
    onChange?: (value: string) => void;
};

export default function CustomDropDownMenu({ onChange }: Props) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(options[0]);
    const ref = useRef<HTMLDivElement>(null);

    // အပြင်ဘက်ကို နှိပ်ရင် ပိတ်မယ်
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const handleSelect = (option: (typeof options)[number]) => {
        setSelected(option);
        setOpen(false);
        onChange?.(option.value);
    };

    return (
        <div className="relative inline-block text-left" ref={ref}>
            {/* Dropdown button (menu) */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
                {selected.label}
                <svg
                    className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                </svg>
            </button>

            {/* Dropdown items */}
            {open && (
                <div className="absolute left-0 z-50 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className={`block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
                                option.value === selected.value ? 'bg-gray-50 font-semibold dark:bg-gray-700' : ''
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}