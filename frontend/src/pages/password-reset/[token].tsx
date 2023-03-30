import ApplicationLogo from '@/old_components/ApplicationLogo'
import AuthCard from '@/old_components/AuthCard'
import AuthSessionStatus from '@/old_components/AuthSessionStatus'
import Button from '@/old_components/Button'
import GuestLayout from '@/old_components/Layouts/GuestLayout'
import Input from '@/old_components/Input'
import InputError from '@/old_components/InputError'
import Label from '@/old_components/Label'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { NextPage } from 'next'
import useAuthNext from '@/hooks/auth/useAuthNext'
import PasswordResetForm from '@/old_components/Auth/PasswordResetForm'

const PasswordReset: NextPage = () => {
    const router = useRouter()

    const { resetPassword } = useAuthNext()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState(null)

    const submitForm = (event: any) => {
        event.preventDefault()

        // Query Token might not exist, so set earlier with defaults
        const token = router.query.token ?? []

        // Reset password
        resetPassword(email, password, passwordConfirmation, token)
            .then(res => router.push('/login?reset=' + btoa(res.status)))
            .catch(err => {
                if (err.response.status !== 422) throw err
                setErrors(err.response.data.errors)
            })
    }

    useEffect(() => {
        setEmail(router.query.email || '')
    }, [router.query.email])

    return (
        <GuestLayout>
            <AuthCard
                logo={
                    <Link href="/">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </Link>
                }>
                {/* Session Status */}
                <AuthSessionStatus className="mb-4" status={status} />

                <PasswordResetForm />
            </AuthCard>
        </GuestLayout>
    )
}

export default PasswordReset
