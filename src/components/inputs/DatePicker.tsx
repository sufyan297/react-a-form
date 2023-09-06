import React, { CSSProperties, ChangeEvent, FC } from 'react';

interface IProps {
    //Props
    name: string;
    disabled?: boolean;
    readonly?: boolean;
    defaultValue?: string;
    hasError: boolean;
    //Events
    onChange: (value: string) => void;
    onBlur?: () => void;

    //Style
    containerStyle?: CSSProperties;
    containerClassName?: string;
    minDate?: string;
    maxDate?: string;
    inputClassName?: string;
}

const DatePicker: FC<IProps> = ({ name, disabled, onChange, readonly, defaultValue, onBlur, hasError, minDate,maxDate, containerStyle, containerClassName, inputClassName }) => {

    //Methods
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange ? onChange(e.target.value) : null;
    }
    const handleBlur = () => {
        onBlur ? onBlur() : null;
    }

    return (
        <div style={{ ...containerStyle }} className={`flex shadow-sm  ${containerClassName ? containerClassName : ''}`}>
            <input type={'date'} min={minDate} max={maxDate} className={`focus:outline-none block flex-1 border-0 bg-transparent py-1.5 pl-3 pr-3 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 rounded-md ring-1 ring-inset focus-within:ring-2 focus-within:ring-inset ${hasError ? 'ring-red-700 focus-within:ring-red-700' : 'ring-gray-300 hover:ring-primary focus-within:ring-primary'} ${inputClassName ? inputClassName : ''}`} name={name} onChange={handleChange} defaultValue={defaultValue} readOnly={readonly} disabled={disabled} onBlur={handleBlur} />
        </div>
    )
}

export default DatePicker;