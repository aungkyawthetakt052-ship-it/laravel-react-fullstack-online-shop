import Swal from 'sweetalert2';

/* =====================================================================
 *  Styled SweetAlert2 helpers (light + dark mode)
 *  Save as: resources/js/lib/alert.ts
 *  Install: npm i sweetalert2
 * ===================================================================== */

const isDark = () => document.documentElement.classList.contains('dark');

// Trash icon (inline SVG, inherits the red color from .swal-icon)
const trashIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  <path d="M10 11v6"/><path d="M14 11v6"/>
</svg>`;

// CSS is injected once, so you don't need to touch app.css
let stylesAdded = false;
function addStyles() {
    if (stylesAdded) return;
    stylesAdded = true;

    const style = document.createElement('style');
    style.textContent = `
    .swal-popup {
        border-radius: 1rem !important;
        padding: 1.75rem 1.5rem 1.5rem !important;
        background: #ffffff;
        color: #111827;
        border: 1px solid #e5e7eb;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,.25) !important;
    }
    .dark .swal-popup { background: #111827; color: #f3f4f6; border-color: #374151; }

    .swal-icon {
        width: 68px !important; height: 68px !important;
        margin: 0 auto 1rem !important;
        border: none !important;
        border-radius: 9999px !important;
        background: rgba(239,68,68,.12);
        color: #ef4444;
    }
    .swal-icon .swal2-icon-content { font-size: 1rem !important; }

    .swal-title { padding: 0 !important; font-size: 1.25rem !important; font-weight: 600 !important; color: inherit !important; }
    .swal-text  { margin: .6rem 0 0 !important; font-size: .9rem !important; line-height: 1.5; color: #6b7280 !important; }
    .dark .swal-text { color: #9ca3af !important; }

    .swal-actions { gap: .75rem; margin-top: 1.5rem !important; width: 100%; }
    .swal-btn {
        flex: 1; border-radius: .65rem !important;
        padding: .65rem 1.25rem !important;
        font-size: .875rem !important; font-weight: 500 !important;
        border: none !important; cursor: pointer;
        transition: background-color .15s, transform .1s;
    }
    .swal-btn:active { transform: scale(.97); }
    .swal-confirm { background: #ef4444 !important; color: #fff !important; }
    .swal-confirm:hover { background: #dc2626 !important; }
    .swal-cancel { background: #f3f4f6 !important; color: #374151 !important; }
    .swal-cancel:hover { background: #e5e7eb !important; }
    .dark .swal-cancel { background: #1f2937 !important; color: #d1d5db !important; }
    .dark .swal-cancel:hover { background: #374151 !important; }
    `;
    document.head.appendChild(style);
}

type ConfirmOptions = {
    title?: string;
    text?: string;
    confirmText?: string;
    cancelText?: string;
};

/**
 * Ask "are you sure?" before deleting.
 * Returns true if the user clicked the confirm button.
 *
 *   if (!(await confirmDelete({ title: 'Delete order #5?' }))) return;
 */
export async function confirmDelete({
    title = 'Delete this item?',
    text = "This action can't be undone.",
    confirmText = 'Yes, delete',
    cancelText = 'Cancel',
}: ConfirmOptions = {}): Promise<boolean> {
    addStyles();

    const result = await Swal.fire({
        title,
        text,
        iconHtml: trashIcon,
        showCancelButton: true,
        reverseButtons: true, // Cancel on the left, Delete on the right
        focusCancel: true, // Enter key = Cancel (safer)
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        buttonsStyling: false,
        backdrop: 'rgba(0,0,0,.55)',
        customClass: {
            popup: 'swal-popup',
            icon: 'swal-icon',
            title: 'swal-title',
            htmlContainer: 'swal-text',
            actions: 'swal-actions',
            confirmButton: 'swal-btn swal-confirm',
            cancelButton: 'swal-btn swal-cancel',
        },
    });

    return result.isConfirmed;
}

/**
 * Small toast in the top-right corner.
 *
 *   toast('success', 'Order deleted');
 */
export function toast(
    icon: 'success' | 'error' | 'info' | 'warning',
    title: string,
) {
    const dark = isDark();

    return Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        background: dark ? '#1f2937' : '#ffffff',
        color: dark ? '#f3f4f6' : '#111827',
    }).fire({ icon, title });
}