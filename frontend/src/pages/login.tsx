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
import authErr from '@/types/auth/authErr'
import LoginForm from '@/old_components/Auth/LoginForm'
import AuthPageLayout from '@/components/layouts/auth-layout'
import { useTranslation } from 'next-i18next'

const Login: NextPage = () => {
    const router = useRouter()
    const {t} = useTranslation()

    const [errors, setErrors] = useState<authErr | string[]>([])
    const [localStatus, setLocalStatus] = useState(null)

    useEffect(() => {
        if (router.query.reset?.length > 0 && errors.length === 0) {
            setLocalStatus(atob(router.query.reset))
        } else {
            setLocalStatus(null)
        }
    })

    return (

    <AuthPageLayout>
        <h3 className="mb-6 mt-4 text-center text-base italic text-body">
            {t('admin-login-title')}
        </h3>
        {/* Session Status */}
        <AuthSessionStatus className="mb-4" status={localStatus} />
        <LoginForm />
    </AuthPageLayout>
    )
}

export default Login
