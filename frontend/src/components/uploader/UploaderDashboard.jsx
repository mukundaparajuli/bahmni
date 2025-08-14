import React from 'react'
import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar'
import { AppSidebar } from './UploaderSidebar'
import { Outlet } from 'react-router-dom'

const UploaderDashboard = () => {
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

export default UploaderDashboard