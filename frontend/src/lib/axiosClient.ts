import Axios, { AxiosError, AxiosRequestHeaders } from 'axios'
import { getSession } from 'next-auth/react'

const axiosClient = () => {
    // Absolutely essential headers to make laravel sanctum auth work
    const defaultHeaders: AxiosRequestHeaders = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Without origin, will always give 401 unauth, MAKE SURE THIS IS SET!
        origin: process.env.NEXTAUTH_URL_INTERNAL ?? 'http://localhost:3000',
    }

    const axios = Axios.create({
        baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
        headers: defaultHeaders,
        withCredentials: true,
    })

    const axiosCilentVersion = Axios.create({
        baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
        headers: defaultHeaders,
        withCredentials: true,
    })

    /**
     * Special interceptors to add the auth header from session to the axiosCilent
     *
     * Checks if auth header already set, if so then just return request, otherwise adds it to the axiosCilent
     */
    axiosCilentVersion.interceptors.request.use(async request => {
        // Check for existing auth headers, ignore if already set
        const existingAuthHeader = hasAccessTokenHeader()

        // Auth headers not set, get token from session and set it
        if (!existingAuthHeader) {
            const session = await getSession()

            if (session && session.user) {
                // @ts-ignore Set access token as default setting
                setAccessToken(session.user.accessToken ?? '')
                request.headers.common[
                    'Authorization'
                ] = `Bearer ${session.user.accessToken}`
            }
        }

        return request
    })

    //#region Set or Check Defaults
    /**
     * Check if there's access token set
     * @returns
     */
    const hasAccessTokenHeader = (): boolean => {
        return axiosCilentVersion.defaults.headers.common['Authorization'] !==
            undefined
            ? true
            : false
    }

    /**
     * Set default auth header, must be done in the axios clent class, otherwise will not be perma set
     * @param token
     */
    const setAccessToken = (token: string) => {
        axiosCilentVersion.defaults.headers.common[
            'Authorization'
        ] = `Bearer ${token}`
    }
    //#endregion

    /**
     * Requests for backend only. As it needs the cookies set in order to submit the request
     *
     * Cilentside would already have cookies set, so it only needs to do a normal request
     *
     * @param method
     * @param url
     * @param body
     * @param cookies
     * @returns
     */
    const backendRequest = (
        method: string = 'get',
        url: string,
        body = null,
        cookies: string[],
    ) => {
        // Cookies (CSRF) must be set, otherwise all requests will give unauth errors
        return axios
            .request({
                method: method,
                url: url,
                data: body,
                headers: createLaravelCSRFHeader(cookies),
            })
            .then(res => res)
            .catch((err: AxiosError) => {
                throw err
            })
    }

    //#region Helpers
    /**
     * Get required csrf values from Laravel Sanctum header
     * @param csrfSetCookies
     * @returns
     */
    const getLaravelSanctumCookies = (csrfSetCookies: string[]) => {
        let cookies = csrfSetCookies[0].split(';')[0] + '; '
        cookies += csrfSetCookies[1].split(';')[0] + '; '
        return cookies
    }

    /**
     * Get XSRF Token Value from Laravel Sanctum header value
     * @param csrfSetCookies
     * @returns
     */
    const getXSRFVal = (csrfSetCookies: string[]) => {
        return decodeURIComponent(
            csrfSetCookies[0].split(';')[0].replace('XSRF-TOKEN=', ''),
        )
    }

    //#endregion Helpers

    //#region Getters/Setters
    //#endregion Getters/Setters

    /**
     * Still need this for some cilentside auth requests, ones where user doesn't need to login but csrf protected
     * @returns
     */
    const getCSRF = () => {
        return axios
            .get('/sanctum/csrf-cookie')
            .then(res => res)
            .catch((err: AxiosError) => {
                throw err
            })
    }

    /**
     * Gets Sanctum cookie
     * @returns
     */
    const getCSRFToken = () => {
        return axios
            .get('/sanctum/csrf-cookie')
            .then(res => {
                return res.headers['set-cookie'] ?? []
            })
            .catch((err: AxiosError) => {
                throw err
            })
    }

    /**
     * Creates the header required for csrf and laravel sanctum to work properly
     * @param setCookiesCSRFToken
     * @returns
     */
    const createLaravelCSRFHeader = (setCookiesCSRFToken: string[]) => {
        return {
            Cookie: getLaravelSanctumCookies(setCookiesCSRFToken),
            'X-XSRF-TOKEN': getXSRFVal(setCookiesCSRFToken),
        }
    }

    return {
        axios,
        axiosCilentVersion,
        getCSRF,

        backendRequest,
        getCSRFToken,
    }
}

export default axiosClient
