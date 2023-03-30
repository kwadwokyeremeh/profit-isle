import { AUTH_TOKEN_KEY } from '@/lib/constants'
import type { SearchParamOptions } from '@/types'
// import axios from 'axios';
import Cookies from 'js-cookie'
import Router from 'next/router'
import axios, { AxiosError, AxiosRequestHeaders } from 'axios'
import { getSession } from 'next-auth/react'
import Axios from 'axios'

const axiosClient = () => {
    // Absolutely essential headers to make laravel sanctum auth work
    const defaultHeaders: AxiosRequestHeaders = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Without origin, will always give 401 unauth, MAKE SURE THIS IS SET!
        origin: process.env.NEXTAUTH_URL_INTERNAL ?? 'http://localhost:3000',
    }

    const Axios = axios.create({
        baseURL: process.env.NEXT_PUBLIC_REST_API_ENDPOINT,
        timeout: 5000000,
        headers: defaultHeaders,
        withCredentials: true,
    })

    const axiosCilentVersion = axios.create({
        baseURL: process.env.NEXT_PUBLIC_REST_API_ENDPOINT,
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
        return Axios.request({
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

    /**
     * Still need this for some cilentside auth requests, ones where user doesn't need to login but csrf protected
     * @returns
     */
    const getCSRF = () => {
        return Axios.get('/sanctum/csrf-cookie')
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
        return Axios.get('/sanctum/csrf-cookie')
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
        Axios,
        axiosCilentVersion,
        getCSRF,

        backendRequest,
        getCSRFToken,
    }
}
// Change request data/error here
Axios.interceptors.request.use(config => {
    const token = Cookies.get(AUTH_TOKEN_KEY)
    config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token ? token : ''}`,
    }
    return config
})

// Change response data/error here
Axios.interceptors.response.use(
    response => response,
    error => {
        if (
            (error.response && error.response.status === 401) ||
            (error.response && error.response.status === 403) ||
            (error.response &&
                error.response.data.message === 'AFRIMART_ERROR.NOT_AUTHORIZED')
        ) {
            Cookies.remove(AUTH_TOKEN_KEY)
            Router.reload()
        }
        return Promise.reject(error)
    },
)

export class HttpClient {
    static async get<T>(url: string, params?: unknown) {
        const response = await Axios.get<T>(url, { params })
        return response.data
    }

    static async post<T>(url: string, data: unknown, options?: any) {
        const response = await Axios.post<T>(url, data, options)
        return response.data
    }

    static async put<T>(url: string, data: unknown) {
        const response = await Axios.put<T>(url, data)
        return response.data
    }

    static async delete<T>(url: string) {
        const response = await Axios.delete<T>(url)
        return response.data
    }

    static formatSearchParams(params: Partial<SearchParamOptions>) {
        return Object.entries(params)
            .filter(([, value]) => Boolean(value))
            .map(([k, v]) =>
                [
                    'type',
                    'categories',
                    'tags',
                    'author',
                    'manufacturer',
                ].includes(k)
                    ? `${k}.slug:${v}`
                    : `${k}:${v}`,
            )
            .join(';')
    }
}
