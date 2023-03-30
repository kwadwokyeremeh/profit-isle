import { useRouter } from 'next/router'
import { useState } from 'react'
import * as Yup from 'yup'
import useAuthNext from '@/hooks/auth/useAuthNext'
import authErr from '@/types/auth/authErr'
import { Form, Formik } from 'formik'

import styles from '@/old_components/Auth/LoginForm.module.css'
import Button from '@/old_components/Button'
import InputError from '@/old_components/InputError'
import MyTextInput from '@/old_components/Forms/MyTextInput'
import passwordResetType from '@/types/auth/passwordResetType'

const PasswordResetForm = ({}) => {
    const [errors, setErrors] = useState<authErr | string[]>([])

    const router = useRouter()

    const { resetPassword } = useAuthNext()

    //#region Form Defaults/Validation and Boilerplates
    const initFormValues: passwordResetType = {
        email: '',
        password: '',
        passwordConfirmation: '',
    }

    /**
     * Form Validation Checkers
     */
    const formValidation = Yup.object({
        email: Yup.string().email('Invalid Email Address').required('Required'),
        password: Yup.string()
            .max(255, 'Must be 255 characters or less')
            .required('Required'),
        passwordConfirmation: Yup.string()
            .max(255, 'Must be 255 characters or less')
            .required('Required'),
    })
    //#endregion Form Defaults/Validation and Boilerplates

    const handleSubmit = async (formVals: passwordResetType) => {
        // // Post off login
        // Query Token might not exist, so set earlier with defaults
        const token = router.query.token ?? []

        // Reset password
        resetPassword(
            formVals.email,
            formVals.password,
            formVals.passwordConfirmation,
            token,
        )
            .then(res => router.push('/login?reset=' + btoa(res.status)))
            .catch(err => {
                if (err.response.status !== 422) throw err
                setErrors(err.response.data.errors)
            })

        // TODO: Add toasts
        // Create toast that resolves on the promise
        // Shows the error message from api error as well
        // toast.promise(registerPromise, {
        //     success: 'Successfully Added New Moment!',
        //     pending: 'Adding New Moments',
        //     error: {
        //         render({ data }) {
        //             return `${
        //                 data.response.data.message ??
        //                 'Something went wrong, please try again later'
        //             }`
        //         },
        //     },
        // })
    }

    // Notice the onChange handlers? Although Formik "should" auto handle input, that only works
    // if the fields are in the same file. Which gets fairly messy. Instead just onChange so things can be
    // nicely separated and relatively usable reusable
    return (
        <Formik
            initialValues={initFormValues}
            validationSchema={formValidation}
            onSubmit={(values, { resetForm }) => {
                // Use finally since submitting is set to false whether it succeeds or not, reduces repeat code
                handleSubmit(values).finally(() => {
                    // Clear form
                    resetForm({})
                })
            }}>
            {/* Added props get get Formilk values and directly set the field values */}
            {({ values, setFieldValue }) => (
                <Form className={styles.form}>
                    <InputError messages={errors.email} className="mt-2" />

                    <div className={`${styles.form_item}`}>
                        <MyTextInput
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="example@example.com"
                            onChange={(event: any) => {
                                setFieldValue(
                                    event.target.name,
                                    event.target.value,
                                )
                            }}
                        />
                    </div>

                    <div className={`${styles.form_item}`}>
                        <MyTextInput
                            label="Password"
                            name="password"
                            type="password"
                            placeholder=""
                            onChange={(event: any) => {
                                setFieldValue(
                                    event.target.name,
                                    event.target.value,
                                )
                            }}
                        />
                    </div>

                    <div className={`${styles.form_item}`}>
                        <MyTextInput
                            label="Password Confirmation"
                            name="passwordConfirmation"
                            type="password"
                            placeholder=""
                            onChange={(event: any) => {
                                setFieldValue(
                                    event.target.name,
                                    event.target.value,
                                )
                            }}
                        />
                    </div>

                    <div className={`${styles.form_action_container} mt-4`}>
                        <Button className={styles.form_btn}>
                            Reset Password
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default PasswordResetForm
