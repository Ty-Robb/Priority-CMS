import type { ReactNode } from 'react';
import { ProtectedPage } from '@/components/auth/protected-page';
import { Logo } from '@/components/logo';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { UserProfileButton } from '@/components/dashboard/user-profile-button';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedPage>
      <SidebarProvider defaultOpen>
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
              <Logo />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <DashboardNav />
          </SidebarContent>
          <SidebarFooter className="p-4">
            <UserProfileButton />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <div className="md:hidden">
               <SidebarTrigger />
            </div>
            <div className="flex-1">
              {/* Optional: Breadcrumbs or Page Title could go here */}
            </div>
            {/* <UserProfileButton /> UserProfileButton moved to sidebar footer for this layout example */}
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedPage>
  );
}
