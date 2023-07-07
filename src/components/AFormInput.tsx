import React, { CSSProperties, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { uniq, get, map } from 'lodash';

//Input components
import TextInput from './inputs/TextInput';
import { IValidations } from '../types';

interface IProps {
    name: string;
    label?: string;
    placeholder?: string;
    type: 'text' | 'number' | 'password' | 'url' | 'email' | 'checkbox';
    validation: IValidations;
    defaultValue?: string;
    disabled?: boolean;
    readOnly?: boolean;
    autocomplete?: boolean;

    //@IMPORTANT Events
    onValidate?: (name: string, errors: string[]) => void;
    handleChange?: (name: string, value: string | string[] | boolean) => void;
    removeElement?: (name: string) => void;

    onChange?: (value: any) => void;
    onBlur?: (value: any) => void;
}

const AFormInput = forwardRef((props: IProps, ref) => {
    //Props
    const { name, type, validation, label, placeholder, defaultValue, disabled, readOnly, autocomplete,
        onValidate, removeElement, handleChange, onChange, onBlur } = props;

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
    const onInputChange = (value: string | string[] | boolean) => {
        setValue(value);
        handleChange ? handleChange(name, value) : null;
        onChange ? onChange(value) : null;
    }
    const onInputBlur = (value?: string) => {
        onValidation();
        onBlur ? onBlur(value) : null;
    }

    const onValidation = () => {
        // const rules = validation ? uniq(validation.split('|')) : [];
        // console.log("RULES: ", rules);
        let errors: string[] = [];
        validation && map(validation,(value: any, rule: string) => {
        //     const newRule = rule ? rule.split(':') : [];
        //     let tmpError: string[] = [];
        //     switch (get(newRule, '[0]', rule)) {
        //         case 'required': tmpError = isRequired(); break;
        //         case 'email': tmpError = isEmail(); break;
        //         case 'strong_password': tmpError = isStrongPassword(); break;
        //         case 'ifsc': tmpError = isIfsc(); break;
        //         case 'number': tmpError = isNumber(); break;
        //         case 'min': tmpError = isMin(newRule[1]); break;
        //         case 'max': tmpError = isMax(newRule[1]); break;
        //         case 'between': tmpError = isBetween(newRule[1]); break;
        //         case 'url': tmpError = isUrl(); break;
        //         case 'mime': tmpError = hasMime(newRule[1]); break;
        //     }
        //     errors = [...errors, ...tmpError];
        });
        setErrors(errors);
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
            label && typeof label == 'string' && type != 'checkbox' ?
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
                    // containerStyle={containerStyle}
                    // maskPlaceholder={maskPlaceholder}
                    // maskFormat={maskFormat}
                    autocomplete={autocomplete}
                />
            : null
        }
        </div>
    )
});
export default AFormInput;