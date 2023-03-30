import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { ReactNode } from 'react'

type Props = {
    children: ReactNode
}

const GuestLayout = ({ children }: Props) => {
    return (
        <div>
            <Head>
                <title>Laravel</title>
            </Head>

            <div className="font-sans text-gray-900 antialiased">
                {children}
            </div>
        </div>
    )
}

export default GuestLayout
