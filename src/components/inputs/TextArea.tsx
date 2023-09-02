import React, { CSSProperties, ChangeEvent, FC, FocusEvent } from 'react';
interface IProps {
    name: string;
    readonly?: boolean;
    disabled?: boolean;
    placeholder?: string;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
    defaultValue?: string;
    hasError: boolean;

    //Style
    containerStyle?: CSSProperties;
    inputStyle?: CSSProperties;
    containerClassName?: string;
    inputClassName?: string;
}
const TextArea: FC<IProps> = ({ name, placeholder, readonly, disabled, inputClassName, containerClassName, inputStyle, onChange, onBlur, defaultValue, hasError }) => {
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange ? onChange(e.target.value) : null;
    }
    const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
        onBlur ? onBlur(e.target.value) : null;
    }
    return (
        <div className={`flex shadow-sm  ${containerClassName ? containerClassName : ''}`}>
            <textarea
                className={`focus:outline-none block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 rounded-md ring-1 ring-inset focus-within:ring-2 focus-within:ring-inset ${hasError ? 'ring-red-700 focus-within:ring-red-700' : 'ring-gray-300 hover:ring-primary focus-within:ring-primary'} ${inputClassName ? inputClassName : ''}`}
                style={inputStyle}
                name={name}
                defaultValue={defaultValue}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readonly}
                onChange={handleChange}
                onBlur={handleBlur}
            >
            </textarea>
        </div>
    )
}
export default TextArea;