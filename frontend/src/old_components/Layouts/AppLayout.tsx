import Navigation from '@/old_components/Layouts/Navigation'
import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'
import AccessDenied from '../Auth/AccessDenied'
import Protected from '../Auth/Protected'
import GuestLayout from './GuestLayout'

type Props = {
    header: ReactNode
    children: ReactNode
}

const AppLayout = ({ header, children }: Props) => {
    const { data: session } = useSession()

    return (
        <Protected>
            <div className="min-h-screen bg-gray-100">
                <Navigation user={session?.user} />

                {/* Page Heading */}
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>

                {/* Page Content */}
                <main>{children}</main>
            </div>
        </Protected>
    )
}

export default AppLayout
