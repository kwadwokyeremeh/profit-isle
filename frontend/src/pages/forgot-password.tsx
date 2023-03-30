import ApplicationLogo from '@/old_components/ApplicationLogo'
import AuthCard from '@/old_components/AuthCard'
import AuthSessionStatus from '@/old_components/AuthSessionStatus'
import Button from '@/old_components/Button'
import GuestLayout from '@/old_components/Layouts/GuestLayout'
import Input from '@/old_components/Input'
import InputError from '@/old_components/InputError'
import Label from '@/old_components/Label'
import Link from 'next/link'
import { useState } from 'react'
import { NextPage } from 'next'
import useAuthNext from '@/hooks/auth/useAuthNext'
import authErr from '@/types/auth/authErr'
import ForgotPasswordForm from '@/old_components/Auth/ForgotPasswordForm'

const ForgotPassword: NextPage = () => {
    const { forgotPassword } = useAuthNext()

    const [email, setEmail] = useState('')
    const [errors, setErrors] = useState<authErr | string[]>([])
    const [localStatus, setLocalStatus] = useState(null)

    return (
        <GuestLayout>
            <AuthCard
                logo={
                    <Link href="/">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </Link>
                }>
                <div className="mb-4 text-sm text-gray-600">
                    Forgot your password? No problem. Just let us know your
                    email address and we will email you a password reset link
                    that will allow you to choose a new one.
                </div>

                {/* Session Status */}
                <AuthSessionStatus className="mb-4" status={localStatus} />

                <ForgotPasswordForm />
            </AuthCard>
        </GuestLayout>
    )
}

export default ForgotPassword
