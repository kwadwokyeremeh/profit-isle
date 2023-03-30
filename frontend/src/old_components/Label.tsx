import { LabelHTMLAttributes, ReactNode } from 'react'

type Props = {
    className?: string
    children: ReactNode
}

const Label = ({
    className,
    children,
    ...props
}: Props & LabelHTMLAttributes<HTMLLabelElement>) => (
    <label
        className={`${className} label`} {...props}>
        <span className='label-text'>
            {children}
        </span>
    </label>
)

export default Label
