import ApproverDashboard from '@/components/ApproverDashboard'
import ProtectedRoute from '@/routes/protected-route'
import React from 'react'

const ApproverPage = () => {
    return (
        <ProtectedRoute roles={['Approver']}>
            <ApproverDashboard />
        </ProtectedRoute>
    )
}

export default ApproverPage