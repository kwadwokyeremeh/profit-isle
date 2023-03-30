import { Field, useField } from 'formik'
import InputError from '@/old_components/InputError'
import Label from '@/old_components/Label'

import styles from './MyTextInput.module.css'

const MyTextInput = ({ label, classNames = '', ...props }: any) => {
    // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
    // which we can spread on <input>. We can use field meta to show an error
    // message if the field is invalid and it has been touched (i.e. visited)
    const [field, meta] = useField(props)

    return (
        <>
            <Label htmlFor={props.id || props.name}>
                <span className="label-text">{label}</span>
            </Label>

            <Field
                className={
                    classNames === '' ? styles.form_text_input : classNames
                }
                {...field}
                {...props}
            />

            {meta.touched && meta.error ? (
                <InputError messages={[meta.error] ?? []} className="mt-2" />
            ) : null}
        </>
    )
}

export default MyTextInput
