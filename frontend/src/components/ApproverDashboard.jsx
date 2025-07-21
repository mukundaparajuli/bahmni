import React from 'react'
import { SidebarProvider, SidebarTrigger } from './ui/sidebar'
import { AppSidebar } from './ApproverSidebar'
import { Outlet } from 'react-router-dom'

const ApproverDashboard = () => {
    return (
        <div>
            <SidebarProvider>
                <AppSidebar />
                <SidebarTrigger />
                <Outlet />
            </SidebarProvider>
        </div>
    )
}

export default ApproverDashboard