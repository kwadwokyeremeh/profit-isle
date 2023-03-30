import { ButtonHTMLAttributes } from 'react'

const Button = ({
    type = 'submit', className, ...props
}: {
    type?: 'submit' | 'button' | 'reset',
    className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        type={type}
        className={`${className} btn`}
        {...props}
    />
)

export default Button
