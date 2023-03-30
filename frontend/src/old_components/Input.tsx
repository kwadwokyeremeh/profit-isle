type Props = {
    disabled?: boolean
    className?: string

    // For spread operator props
    [x: string]: any
}

const Input = ({ disabled = false, className, ...props }: Props) => (
    <input
        disabled={disabled}
        className={`${className} input w-full max-w-md dark:text-white`}
        {...props}
    />
)

export default Input
