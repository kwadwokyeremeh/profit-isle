import ApplicationLogo from '@/old_components/ApplicationLogo'
import AuthCard from '@/old_components/AuthCard'
import Button from '@/old_components/Button'
import GuestLayout from '@/old_components/Layouts/GuestLayout'
import Link from 'next/link'
import { useState } from 'react'
import { NextPage } from 'next'
import useAuthNext from '@/hooks/auth/useAuthNext'
import useAuthMiddleware from '@/hooks/auth/useAuthMiddleware'

const VerifyEmail: NextPage = () => {
    // Redirect to dashboard if authed
    const {} = useAuthMiddleware('/dashboard')

    const [localStatus, setLocalStatus] = useState(null)

    const { resendEmailVerification, signOutApp } = useAuthNext()

    /**
     * Must be function to deal with promise afterwards
     * @returns
     */
    const handleResendEmail = async () => {
        return resendEmailVerification()
            .then(res => {
                setLocalStatus(res.status)
            })
            .catch(err => err)
    }

    return (
        <GuestLayout>
            <AuthCard
                logo={
                    <Link href="/">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </Link>
                }>
                <div className="mb-4 text-sm text-gray-600">
                    Thanks for signing up! Before getting started, could you
                    verify your email address by clicking on the link we just
                    emailed to you? If you didn&apos;t receive the email, we
                    will gladly send you another.
                </div>

                {localStatus === 'verification-link-sent' && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        A new verification link has been sent to the email
                        address you provided during registration.
                    </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                    <Button onClick={handleResendEmail}>
                        Resend Verification Email
                    </Button>

                    <button
                        type="button"
                        className="text-sm text-gray-600 underline hover:text-gray-900"
                        onClick={signOutApp}>
                        Logout
                    </button>
                </div>
            </AuthCard>
        </GuestLayout>
    )
}

export default VerifyEmail
