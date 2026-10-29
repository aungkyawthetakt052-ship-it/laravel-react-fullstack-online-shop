


import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function ChangeTheme({
    className = '',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    const { appearance, updateAppearance } = useAppearance();

    // false = server နဲ့ ပထမ render မှာ တူအောင်၊ browser ရောက်မှ true ဖြစ်မယ်
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // mounted မဖြစ်သေးရင် မစစ်ဘူး (window / matchMedia ကို ပထမ render မှာ မထိဘူး)
    // 'system' ဖြစ်နေရင် စက်ရဲ့ theme အတိုင်း dark ဟုတ်မဟုတ် စစ်မယ်
    const isDark =
        mounted &&
        (appearance === 'dark' ||
            (appearance === 'system' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches));

    return (
        <button
            type="button"
            // နှိပ်ရင် ဟိုဘက် theme ကို ပြောင်းမယ်
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            className={cn(
                'flex items-center gap-2 rounded-md bg-gray-600 px-4 py-1.5 text-white transition-colors',
                'hover:bg-gray-500 dark:border dark:border-gray-700 dark:bg-gray-800',
                'dark:text-gray-200 dark:hover:bg-gray-700',
                className,
            )}
            {...props}
        >
            {isDark ? (
                <>
                    <Sun size={16} /> <span className='text-sm'>Light</span>
                </>
            ) : (
                <>
                    <Moon size={16} /><span className='text-sm'> Dark</span> 
                </>
            )}
        </button>
    );
}

// import { Moon, Sun } from 'lucide-react';
// import { useEffect, useState } from 'react';

// export default function ChangeTheme() {
//     const [dark, setDark] = useState<boolean>(() => {
//         const saved = localStorage.getItem('theme');
//         return saved
//             ? saved === 'dark'
//             : window.matchMedia('(prefers-color-scheme: dark)').matches;
//     });

//     useEffect(() => {
//         document.documentElement.classList.toggle('dark', dark);
//         localStorage.setItem('theme', dark ? 'dark' : 'light');
//     }, [dark]);

//     return (
//         <div className="text-gray-900 dark:bg-black dark:text-white">
//             <button
//                 onClick={() => setDark((d) => !d)}
//                 className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-1.5
//                  text-white hover:bg-gray-500 dark:bg-gray-800 
//                  dark:border dark:hover:bg-gray-700
//                 dark:border-gray-700 dark:text-gray-200"
//             >
//                 {dark ? (
//                     <>
//                         <Sun size={16} /> Light
                        
//                     </>
//                 ) : (
//                     <>
//                         <Moon size={16} />Dark
//                     </>
//                 )}
//             </button>
//         </div>
//     );
// }

// import type { LucideIcon } from 'lucide-react';
// import { Monitor, Moon, Sun } from 'lucide-react';
// import type { HTMLAttributes } from 'react';
// import type { Appearance } from '@/hooks/use-appearance';
// import { useAppearance } from '@/hooks/use-appearance';
// import { cn } from '@/lib/utils';

// export default function ChangeTheme({
//     className = '',
//     ...props
// }: HTMLAttributes<HTMLDivElement>) {
//     const { appearance, updateAppearance } = useAppearance();

//     const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
//         { value: 'light', icon: Sun, label: 'Light' },
//         { value: 'dark', icon: Moon, label: 'Dark' },
//     ];

//     return (
//         <div
//             className={cn(
//                 'inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800',
//                 className,
//             )}
//             {...props}
//         >
//             {tabs.map(({ value, icon: Icon, label }) => (
//                 <button
//                     key={value}
//                     onClick={() => updateAppearance(value)}
//                     className={cn(
//                         'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
//                         appearance === value
//                             ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
//                             : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
//                     )}
//                 >
//                     <Icon className="-ml-1 h-4 w-4" />
//                     <span className="ml-1.5 text-sm">{label}</span>
//                 </button>
//             ))}
//         </div>
//     );
// }
