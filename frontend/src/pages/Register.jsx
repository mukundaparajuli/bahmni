import AuthLayout from '@/components/common/AuthLayout'
import RegisterForm from '@/components/RegisterForm'
import React from 'react'

const Register = () => {
    return (
        <AuthLayout title="Register">
            <RegisterForm />
        </AuthLayout>
    )
}

export default Register