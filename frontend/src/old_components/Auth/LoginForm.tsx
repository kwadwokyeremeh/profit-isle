import { useRouter } from 'next/router'
import { useState } from 'react'
import * as Yup from 'yup'
import useAuthNext from '@/hooks/auth/useAuthNext'
import authErr from '@/types/auth/authErr'
import { toast } from 'react-toastify'

import Link from 'next/link'
import LoginInputType from '@/types/auth/loginType'
import { Form } from '@/components/ui/forms/form'
import Input from '@/components/ui/forms/input'
import PasswordInput from '@/components/ui/forms/password-input'
import Alert from '@/components/ui/alert'
import errorMessage from '@/components/ui/error-message'
import { Routes } from '@/config/routes'
import Button from '@/components/ui/button'
import { useTranslation } from 'next-i18next'

const LoginForm = ({}) => {
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<authErr | string[]>([])
    const [isLoading,setIsLoading] = useState(false)

    const router = useRouter()

    const { signInApp } = useAuthNext()

    //#region Form Defaults/Validation and Boilerplates
    const initFormValues: LoginInputType = {
        email: '',
        password: '',
        remember: true,
    }

    /**
     * Form Validation Checkers
     */
    const formValidationSchema = Yup.object({
        email: Yup.string().email('Invalid Email Address').required('Required'),
        password: Yup.string()
            .max(255, 'Must be 255 characters or less')
            .required('Required'),
        remember: Yup.boolean().required('Required'),
    })
    //#endregion Form Defaults/Validation and Boilerplates

    const handleSubmit = async (formVals: LoginInputType) => {
        // // Post off login
        let loginPromise = signInApp(
            formVals.email,
            formVals.password,
            formVals.remember,
        )
            .then(res => {
                // NextAuth can't throw an error by default
                if (!res.ok) {
                    throw {
                        error: res.error,
                        status: res.status,
                    }
                } else {
                    // Logged in, redirect to home
                    router.push(Routes.home)
                }
            })
            .catch(err => {
                // Technically doesn't work, but uncaught thrown objects will result in an error
                setErrors({
                    email: [
                        err.error ?? 'System Error: Please Try Again Later',
                    ],
                })
                throw err
            })

        // Create toast that resolves on the promise
        // Shows the error message from api error as well
        toast.promise(loginPromise, {
            success: 'Successfully Logged In!',
            pending: 'Logging In...',
            error: {
                render(err: any) {
                    if (err.data.status >= 500)
                        return 'System Error: Please Try Again Later'

                    return `${
                        err.data.error ??
                        'Something went wrong, please try again later'
                    }`
                },
            },
        })
    }

    // Notice the onChange handlers? Although Formik "should" auto handle input, that only works
    // if the fields are in the same file. Which gets fairly messy. Instead just onChange so things can be
    // nicely separated and relatively usable reusable
    return (
    <>
        <Form<LoginInputType> validationSchema={formValidationSchema}
                              onSubmit={(values) => {handleSubmit(values)}}>
            {({ register, formState: { errors } }) => (
                <>
                    <Input
                        label={t('form:input-label-email')}
                        {...register('email')}
                        type="email"
                        variant="outline"
                        className="mb-4"
                        error={t(errors?.email?.message!)}

                    />
                    <PasswordInput
                        label={t('form:input-label-password')}
                        forgotPassHelpText={t('form:input-forgot-password-label')}
                        {...register('password')}
                        error={t(errors?.password?.message!)}
                        variant="outline"
                        className="mb-4"
                        forgotPageLink={Routes.forgotPassword}
                    />
                    <Button className="w-full" loading={isLoading} disabled={isLoading}>
                        {t('form:button-label-login')}
                    </Button>

                    <div className="relative mt-8 mb-6 flex flex-col items-center justify-center text-sm text-heading sm:mt-11 sm:mb-8">
                        <hr className="w-full" />
                        <span className="absolute -top-2.5 bg-light px-2 -ms-4 start-2/4">
                {t('common:text-or')}
              </span>
                    </div>
                    {/* Remember Me */}
                    {/*<div className="form-control w-full max-w-md">*/}
                    {/*    <label*/}
                    {/*        className="label flex cursor-pointer justify-start"*/}
                    {/*        htmlFor="remember_me">*/}
                    {/*        <Field*/}
                    {/*            id="remember_me"*/}
                    {/*            type="checkbox"*/}
                    {/*            name="remember"*/}
                    {/*            className="checkbox"*/}
                    {/*        />*/}

                    {/*        <span className="label-text pl-2">Remember me</span>*/}
                    {/*    </label>*/}
                    {/*</div>*/}
                    <div className="text-center text-sm text-body sm:text-base">
                        {t('form:text-no-account')}{' '}
                        <Link
                            href={Routes.register}
                            className="font-semibold text-accent underline transition-colors duration-200 ms-1 hover:text-accent-hover hover:no-underline focus:text-accent-700 focus:no-underline focus:outline-none"
                        >
                            {t('form:link-register-shop-owner')}
                        </Link>
                    </div>
                </>
            )}
        </Form>
        {errorMessage ? (
            <Alert
                message={t(errorMessage)}
                variant="error"
                closeable={true}
                className="mt-5"
                onClose={() => setErrorMessage(null)}
            />
        ) : null}
    </>

)
}

export default LoginForm
