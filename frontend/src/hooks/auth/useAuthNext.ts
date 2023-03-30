import axiosClient from '@/lib/axiosClient'
import { signIn, SignInResponse, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

/**
 * Must always set the API token before calling API, otherwise will get unauth error.
 * @returns
 */
const useAuth = () => {
    const { axios, getCSRF } = axiosClient()

    //#region Getters/Setters
    //#endregion Getters/Setters

    /**
     * Sign in via next-auth
     * @param email
     * @param password
     * @param remember
     * @returns
     */
    const signInApp = async (
        email: string,
        password: string,
        remember: boolean,
    ) => {
        return signIn('credentials', {
            redirect: false,
            email: email,
            password: password,
            remember: remember,
        })
            .then(res => {
                // Should never be undef, probs gonna screw me over in the future
                return res!;
            })
            .catch(err => {
                throw err;
            })
    }

    /**
     * Register into app
     * @param firstName
     * @param lastName
     * @param email
     * @param password
     * @param passwordConfirm
     * @returns
     */
    const register = async (
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        passwordConfirm: string,
    ) => {
        return axios
            .post('/register', {
                firstName,
                lastName,
                email,
                password,
                passwordConfirm,
            })
            .then(res => res.data)
            .catch(err => err)
    }

    /**
     * Send forget password
     * @param email
     * @returns
     */
    const forgotPassword = async (email: string) => {
        await getCSRF();

        return axios
            .post('/forgot-password', { email })
            .then(res => res.data)
            .catch(err => err)
    }

    /**
     * Reset password
     *
     * @param email
     * @param password
     * @param passwordConfirmation
     * @param token
     * @returns
     */
    const resetPassword = async (
        email: string,
        password: string,
        passwordConfirmation: string,
        token: string | string[],
    ) => {
        await getCSRF();

        return axios
            .post('/reset-password', {
                email,
                password,
                password_confirmation: passwordConfirmation,
                token,
            })
            .then(res => res.data)
            .catch(error => error);
    }

    /**
     * Resends email verification
     * @returns
     */
    const resendEmailVerification = async () => {
        return axios
            .post('/email/verification-notification')
            .then(res => res.data)
            .catch(err => err)
    }

    /**
     * Sign out app, destroys cookie and current session
     * @returns
     */
    const signOutApp = async () => {
        return signOut();
    }

    return {
        signInApp,
        register,
        resendEmailVerification,
        forgotPassword,
        resetPassword,
        signOutApp,
    }
}

export default useAuth
