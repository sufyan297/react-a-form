import React, { CSSProperties, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { map } from 'lodash';

//Input components
import TextInput from './inputs/TextInput';
import { IFile, ISelect, IValidations } from '../types';
import ToggleSwitch from './inputs/ToggleSwitch';
import Checkbox from './inputs/Checkbox';
import ComboBox from './inputs/ComboBox';
import FileInput from './inputs/FileInput';

interface IProps {
    name: string;
    label?: string | React.ReactNode;
    placeholder?: string;
    type: 'text' | 'number' | 'password' | 'url' | 'email' | 'checkbox' | 'toggle' | 'select' | 'file' | 'image';
    validation?: IValidations;
    validationName?: string;
    defaultValue?: string;
    disabled?: boolean;
    readOnly?: boolean;
    autocomplete?: boolean;
    hint?: string;

    //File
    acceptMime?: string;

    //ComboBox / Select
    options?: ISelect[];
    multiple?: boolean;
    loading?: boolean;

    //Syles
    containerStyle?: CSSProperties;
    inputStyle?: CSSProperties;
    containerClassName?: string;
    inputClassName?: string;

    //@IMPORTANT Events
    onValidate?: (name: string, errors: string[]) => void;
    handleChange?: (name: string, value: string | string[] | boolean | IFile[]) => void;
    removeElement?: (name: string) => void;

    onChange?: (value: any) => void;
    onBlur?: (value: any) => void;
}

const AFormInput = forwardRef((props: IProps, ref) => {
    //Props
    const { name, type, validation, validationName, label, placeholder, defaultValue, disabled, readOnly, autocomplete, acceptMime,
        onValidate, removeElement, handleChange, onChange, onBlur, containerStyle, inputStyle, hint, containerClassName, inputClassName, multiple, loading, options } = props;

    //States
    const [value, setValue] = useState<any>(defaultValue); //string | undefined - defaultValue : undefined
    const [errors, setErrors] = useState<string[]>([]);

    //Effects
    useEffect(() => {
        return () => {
            removeElement ? removeElement(name) : null; //ask AForm to remove errors and value from state
        }
    }, []);

    useEffect(() => {
        if (value) {
            onValidation(); //RealTime Validation
        }
    }, [value]);

    useEffect(() => {
        if (errors && errors.length > 0) {
            onValidate ? onValidate(name, errors) : null;
        }
    }, [errors]);

    useImperativeHandle(
        ref,
        () => ({
            handleValidation() {
                onValidation();
            }
        }),
    )

    //@Methods
    const onInputChange = (value: string | string[] | boolean | IFile[]) => {
        setValue(value);
        handleChange ? handleChange(name, value) : null;
        onChange ? onChange(value) : null;
    }
    const onInputBlur = (value?: string | string[] | boolean | IFile[]) => {
        onValidation();
        onBlur ? onBlur(value) : null;
    }

    const onValidation = () => {
        // const rules = validation ? uniq(validation.split('|')) : [];
        // console.log("RULES: ", rules);
        let errors: string[] = [];
        validation && map(validation,(value: any, rule: string) => {
        //     const newRule = rule ? rule.split(':') : [];
            let tmpError: string[] = [];
            switch (rule) {
                case 'required': value === true ? tmpError = isRequired() : undefined; break;
                case 'email': value === true ? tmpError = isEmail() : undefined; break;
        //         case 'strong_password': tmpError = isStrongPassword(); break;
        //         case 'ifsc': tmpError = isIfsc(); break;
                case 'number': value === true ? tmpError = isNumber() : undefined; break;
        //         case 'min': tmpError = isMin(newRule[1]); break;
        //         case 'max': tmpError = isMax(newRule[1]); break;
        //         case 'between': tmpError = isBetween(newRule[1]); break;
        //         case 'url': tmpError = isUrl(); break;
        //         case 'mime': tmpError = hasMime(newRule[1]); break;
            }
            errors = [...errors, ...tmpError];
        });
        setErrors(errors);
    }

    //RULES - VALIDATIONS FUNCTIONS
    const isRequired = () => { //Input is required?
        const errors: string[] = [];
        if (!value || (value && typeof value == 'string' && value.trim() == '')) {
            errors.push((validationName || name) + ' is required');
        }
        if (Array.isArray(value) && value.length === 0) {
            errors.push((validationName || name) + ' is required');
        }
        return errors;
    }
    const isEmail = () => {
        const errors: string[] = [];
        const regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!value && !hasRequired()) return errors;
        if (!value) {
            errors.push('Please enter a valid email address.');
        } else if (!regEx.test(value)) {
            errors.push('"' + value + '" is not a valid email address.');
        }
        return errors;
    }
    const isNumber = () => {
        const errors: string[] = [];
        if (value && isNaN(Number(value))) {
            errors.push((validationName || name) + ' must be a number.');
        }
        return errors;
    }
    //HELPER FUNCTIONS
    const hasRequired = () => {
        if (validation && validation.required && validation.required == true) {
            return true;
        }
        return false;
    }
    
    return (
        <div>
        {
            label && typeof label == 'string' && !['checkbox', 'toggle'].includes(type) ?
                <label htmlFor={name} className={'block text-sm font-medium leading-6 text-gray-800 mb-1.5'}>{label}{hasRequired() ? <span className='text-red-700 text-xs'>*</span> : null}</label>
                : null
        }
        {
            (type == 'text' || type == 'number' || type == 'email' || type == 'url' || type == 'password') ?
                <TextInput
                    name={name}
                    type={type}
                    hasError={errors && errors.length > 0 ? true : false}
                    onChange={(value) => onInputChange(value)}
                    onBlur={onInputBlur}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    disabled={disabled}
                    readonly={readOnly}
                    containerStyle={containerStyle}
                    inputStyle={inputStyle}
                    containerClassName={containerClassName}
                    inputClassName={inputClassName}
                    // maskPlaceholder={maskPlaceholder}
                    // maskFormat={maskFormat}
                    autocomplete={autocomplete}
                />
            : type == 'toggle' ?
                <ToggleSwitch
                    name={name}
                    label={label}
                    onChange={() => onInputChange(!value)}
                    defaultValue={value}
                    containerClassName={containerClassName}
                />
            : type == 'checkbox' ?
                <Checkbox
                    name={name}
                    label={label}
                    onChange={() => onInputChange(!value)}
                    defaultValue={value}
                    containerClassName={containerClassName}
                    disabled={disabled}
                    inputClassName={inputClassName}
                />
            : type == 'select' && options ?
                <ComboBox
                    name={name}
                    hasError={errors && errors.length > 0 ? true : false}
                    options={options}
                    defaultValue={defaultValue}
                    disabled={disabled}
                    containerStyle={containerStyle}
                    inputStyle={inputStyle}
                    multiple={multiple}
                    loading={loading}
                    onChange={(value) => onInputChange(value)}
                    placeholder={placeholder}
                />
            : type == 'file' || type == 'image' ?
                <FileInput
                    name={name}
                    type={type}
                    multiple={multiple}
                    accept={type === 'image' ? 'image/*' : acceptMime}
                    onChange={(files) => onInputChange(files)}
                />
            : null
        }
        {
            hint ? <span className="text-gray text-sm" style={{ color: '#a9a9a9' }}>{hint}</span> : null
        }
        {
            errors && errors.length > 0 ?
                <div className="text-red-700">
                    {
                        errors.map((error, idx) => (
                            <p key={name + idx} style={{ marginBottom: '2px', marginTop: 0 }} className='text-sm'>{error}</p>
                        ))
                    }
                </div>
                : null
        }
        </div>
    )
});
export default AFormInput;