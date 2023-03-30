// TODO: Figure out what the status type is
type Props = {
    status: any,
    className?: string
}

const AuthSessionStatus = ({ status, className, ...props }: Props) => (
    <>
        {status && (
            <div
                className={`${className} font-medium text-sm text-green-600`}
                {...props}>
                {status}
            </div>
        )}
    </>
)

export default AuthSessionStatus
