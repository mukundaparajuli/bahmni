import { Inbox, Scan } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
    {
        title: "Review Documents",
        url: "/approver/review",
        icon: Scan,
    },
    {
        title: "Approved Documents",
        url: "/approver/approved",
        icon: Inbox,
    },
    {
        title: "Rejected Documents",
        url: "/approver/rejected",
        icon: Inbox,
    }
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