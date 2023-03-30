import ApplicationLogo from '@/old_components/ApplicationLogo'
import AuthCard from '@/old_components/AuthCard'
import GuestLayout from '@/old_components/Layouts/GuestLayout'
import Link from 'next/link'
import { NextPage } from 'next'
import useAuthMiddleware from '@/hooks/auth/useAuthMiddleware'
import RegisterForm from '@/old_components/Auth/RegisterForm'

const Register: NextPage = () => {
    // Redirect to dashboard if authed
    const {} = useAuthMiddleware('/dashboard')

    return (
        <GuestLayout>
            <AuthCard
                logo={
                    <Link href="/">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </Link>
                }>
                <RegisterForm />
            </AuthCard>
        </GuestLayout>
    )
}

export default Register
