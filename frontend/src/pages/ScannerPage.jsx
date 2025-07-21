import ScannerDashboard from '@/components/ScannerDashboard'
import ProtectedRoute from '@/routes/protected-route'
import React from 'react'

const ScannerPage = () => {
    return (
        <ProtectedRoute roles={['ScannerClerk']}>
            <ScannerDashboard />
        </ProtectedRoute>
    )
}

export default ScannerPage