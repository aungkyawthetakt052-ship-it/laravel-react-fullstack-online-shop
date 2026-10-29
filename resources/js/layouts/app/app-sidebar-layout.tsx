import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import FlashMessage from '@/components/flash-message';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                )}
                <FlashMessage/>
                {children}
            </AppContent>
        </AppShell>
    );
}
