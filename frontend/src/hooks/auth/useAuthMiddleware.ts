import { useSession } from "next-auth/react";
import { useRouter } from "next/router"
import { useEffect } from "react"

/**
 * Redirects to authRedirect URL when user is authenticated, otherwise does nothing
 * @param authRedirect
 * @returns
 */
const useAuthMiddleware = (authRedirect: string = '') => {
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        // Only redirect when redirect string set
        if (authRedirect === '') return;

        if (status === 'authenticated') {
            router.push(authRedirect);
            return;
        }
    }, [router, status, authRedirect])

    return {

    }
}

export default useAuthMiddleware;
