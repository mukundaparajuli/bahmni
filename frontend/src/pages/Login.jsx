import LoginForm from '@/components/LoginForm'
import AuthLayout from '@/components/common/AuthLayout'
import React from 'react'

const Login = () => {
    return (
        <AuthLayout title="Login">
            <LoginForm />
        </AuthLayout>
    )
}

export default Login