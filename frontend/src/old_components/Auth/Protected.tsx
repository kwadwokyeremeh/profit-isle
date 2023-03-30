import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'
import AccessDenied from './AccessDenied'

type Props = {
    children: ReactNode
}

const Protected = ({ children }: Props) => {
    const { data: session, status } = useSession()
    const loading = status === 'loading'

    // Got rid of window = undefined as that would cause react to not load in local variables
    // Hence when redirecting from different routes, it'd show access denied on refresh
    // This is required otherwise will show flash of access denied page.
    if (loading) return null

    // If no session exists, display access denied message
    if (!session) return <AccessDenied />

    // If session exists, display content
    return (
        <>
            {children}
        </>
    )
}

export default Protected
