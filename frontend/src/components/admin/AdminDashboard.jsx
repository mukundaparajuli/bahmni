import React from 'react'
import { AppSidebar } from './AdminSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Outlet } from 'react-router-dom'

const AdminDashboard = () => {
    return (
        <div className="h-screen flex mt-8">
            <SidebarProvider>
                <AppSidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <SidebarTrigger />
                    <main className="flex-1 overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </SidebarProvider>
        </div>
    )
}

export default AdminDashboard