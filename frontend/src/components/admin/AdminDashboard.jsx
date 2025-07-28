import React from 'react'
import { AppSidebar } from './AdminSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Outlet } from 'react-router-dom'

const AdminDashboard = () => {
    return (
        <div className='mt-8'>
            <SidebarProvider>
                <AppSidebar />
                <SidebarTrigger />
                <Outlet />
            </SidebarProvider>
        </div>
    )
}

export default AdminDashboard