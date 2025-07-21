import React from 'react'
import { AppSidebar } from './ScannerSidebar'
import { SidebarProvider, SidebarTrigger } from './ui/sidebar'
import { Outlet } from 'react-router-dom'

const ScannerDashboard = () => {
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

export default ScannerDashboard