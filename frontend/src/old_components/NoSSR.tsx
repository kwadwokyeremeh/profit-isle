import dynamic from 'next/dynamic'
import React, { Fragment, ReactNode } from 'react'

type Props = {
    children: ReactNode
}

const NoSsr = ({ children }: Props) => (
    <Fragment>
        {children}
    </Fragment>
)

export default dynamic(() => Promise.resolve(NoSsr), {
    ssr: false
});
