import { Users, Building2, Book, Briefcase, Scan, Check, Upload, Copy, BookAIcon, LayoutDashboard } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
    {
        title: "Overview",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "User Management",
        url: "/admin/users",
        icon: Users,
    },
    {
        title: "Department Management",
        url: "/admin/departments",
        icon: Building2,
    },
    {
        title: "Education Management",
        url: "/admin/education",
        icon: Book,
    },
    {
        title: "Profession Management",
        url: "/admin/professions",
        icon: Briefcase,
    },
    {
        title: "Scanners",
        url: "/admin/scanners",
        icon: Scan,
    },
    {
        title: "Approvers",
        url: "/admin/approvers",
        icon: Check,
    },
    {
        title: "Uploaders",
        url: "/admin/uploaders",
        icon: Upload,
    },
    {
        title: "Documents",
        url: "/admin/documents",
        icon: BookAIcon,
    },
    {
        title: "Performance Summary",
        url: "/admin/performance",
        icon: Copy,
    },

]
export function AppSidebar() {
    return (
        <Sidebar className="mt-16">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar >
    )
}