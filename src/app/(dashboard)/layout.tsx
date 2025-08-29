"use client";

import {
  Banknote,
  CreditCard,
  Home,
  PieChart,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

const navigation: NavigationGroup[] = [
  {
    title: "داشبورد",
    items: [
      {
        title: "نمای کلی",
        url: "/",
        icon: Home,
      },
    ],
  },
  {
    title: "مالی",
    items: [
      {
        title: "حساب‌ها",
        url: "/accounts",
        icon: Wallet,
      },
      {
        title: "تراکنش‌ها",
        url: "/transactions",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "تحلیل‌ها",
    items: [
      {
        title: "گزارش‌ها",
        url: "/reports",
        icon: PieChart,
      },
      {
        title: "روندها",
        url: "/trends",
        icon: TrendingUp,
      },
      {
        title: "بودجه",
        url: "/budget",
        icon: Banknote,
      },
    ],
  },
  {
    title: "تنظیمات",
    items: [
      {
        title: "تنظیمات",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Wallet className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">MoneyAR</span>
            <span className="truncate text-xs">امور مالی شخصی</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
          <ModeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg">داشبورد</h1>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
