import React, { CSSProperties, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { uniq, get } from 'lodash';
// import styles from './AFormInput.module.css';

//Input components
import TextInput from './inputs/TextInput';
// import DatePicker from './Inputs/DatePicker';
// import TimePicker from './Inputs/TimePicker';
// import Select, { ISelect } from './Inputs/Select'; //@deprecated
// import TextArea from './Inputs/TextArea';
// import CheckBox from './Inputs/CheckBox';
// import RadioInput from './Inputs/RadioInput';
// import PrimaryButton from '../Shared/PrimaryButton';
// import DateTimePicker from './Inputs/DateTimePicker';
// import FileInput from './Inputs/FileInput';
// import ComboBox, { ISelect } from './Inputs/ComboBox';
import { IQueryOptions, ISelect } from '../types';
// import CreateableComboBox from './Inputs/CreateableComboBox';
// import DateRangePicker from './Inputs/DateRangePicker';
// import RichTextEditor from './Inputs/RichTextEditor';

interface IProps {
    name: string;
    type: 'text' | 'number' | 'password' | 'url' | 'strong_password' | 'email' | 'select' | 'time' | 'date' | 'datetime' | 'date-range' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'submit' | 'createable-select' | 'reset' | 'rich-text-editor';
    buttonTheme?: 'primary' | 'outline';
    //comboBox
    model?: string;
    query?: IQueryOptions;
    searchField?: string | string[];
    //======
    buttonLoading?: boolean;
    labelPosition?: "prefix" | "postfix";
    placeholder?: string;
    autocomplete?: boolean;
    hasError?: boolean;
    hint?: string;
    label?: string | React.ReactNode;
    validation?: 'required' | string;
    validationName?: string;
    defaultValue?: string;
    disabled?: boolean;
    readOnly?: boolean;
    options?: ISelect[];
    multiple?: boolean;
    cols?: number;
    rows?: number;
    inline?: boolean;
    extraitem?: React.ReactNode;
    containerStyle?: CSSProperties;
    fileType?: 'file' | 'image';
    hasPreview?: boolean;
    onValidate?: (name: string, errors: string[]) => void;
    handleChange?: (name: string, value: string | string[] | boolean) => void;
    onChange?: (value: any) => void;
    removeElement?: (name: string) => void;
    inputClassName?: string;
    minDate?: string;
    maxDate?: string;
    maskPlaceholder?: string;
    maskFormat?: string;
    containerBackground?: string;
    containerTextColor?: string;
    mimeAccept?: string; //FileInput - Accept Types - eg. image/png, image/gif, image/jpeg, image/*
    onBlur?: (value: any) => void;
}

// const AFormInput: FC<IProps> = ({ name, type, placeholder, hint, label, validation, validationName, defaultValue, handleChange }, ref) => {
const AFormInput = forwardRef((props: IProps, ref) => {
    //model, query, searchField, containerBackground, containerTextColor, fileType, hasPreview,multiple, rows, cols, inline, extraitem, labelPosition,
    //options,minDate, maxDate, mimeAccept,hasError, inputClassName,buttonTheme, buttonLoading, 
    const { name, type, containerStyle, placeholder, hint, label, validation, validationName, defaultValue, handleChange, onValidate, 
        disabled, readOnly, autocomplete,  removeElement, onChange,
        maskPlaceholder, maskFormat,  onBlur } = props;
    // States
    const [value, setValue] = useState<any>(defaultValue); //string | undefined - defaultValue : undefined
    const [errors, setErrors] = useState<string[]>([]);
    // const [ validationReset, setValidationReset ] = useState<boolean>(false);

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

    //Methods
    const onInputChange = (value: string | string[] | boolean) => {
        setValue(value);
        handleChange ? handleChange(name, value) : null;
        onChange ? onChange(value) : null;
    }

    const onInputBlur = (value?: string) => {
        // console.log("Blur Event occured: ", name);
        onValidation();
        onBlur ? onBlur(value) : null;
    }

    const onValidation = () => {
        const rules = validation ? uniq(validation.split('|')) : [];
        // console.log("RULES: ", rules);
        let errors: string[] = [];
        rules.map((rule: string) => {
            const newRule = rule ? rule.split(':') : [];
            let tmpError: string[] = [];
            switch (get(newRule, '[0]', rule)) {
                case 'required': tmpError = isRequired(); break;
                case 'email': tmpError = isEmail(); break;
                case 'strong_password': tmpError = isStrongPassword(); break;
                case 'ifsc': tmpError = isIfsc(); break;
                case 'number': tmpError = isNumber(); break;
                case 'min': tmpError = isMin(newRule[1]); break;
                case 'max': tmpError = isMax(newRule[1]); break;
                case 'between': tmpError = isBetween(newRule[1]); break;
                case 'url': tmpError = isUrl(); break;
                case 'mime': tmpError = hasMime(newRule[1]); break;
            }
            errors = [...errors, ...tmpError];
        });
        setErrors(errors);
        // if (type != 'submit') {
        //     onValidate ? onValidate(name, errors) : null;
        // }
    }

    // - Rules - Functions
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
    const isStrongPassword = () => {
        const errors: string[] = [];
        // const regEx =  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
        const regEx = /^(?=.*\d|.*\W)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
        if (!value && !hasRequired()) return errors;
        if (!regEx.test(value)) {
            errors.push('Minimum 6 characters, with upper and lowercase and a number or a symbol.');
        }
        return errors;
    }
    const isIfsc = () => {
        const errors: string[] = [];
        const regEx = /^[A-Z]{4}0[A-Z0-9]{6}$/;

        if (!value && !hasRequired()) return errors;

        if (!value) {
            errors.push('Please enter a valid IFSC Code.');
        } else if (!regEx.test(value)) {
            errors.push('"' + value + '" is not a valid IFSC Code.');
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
    const isMin = (validation: string) => {//2 types available - value & length
        const tmpValidation = validation ? validation.split(',') : [];
        const num = get(tmpValidation, '[0]', 1); //Number
        let type = get(tmpValidation, '[1]', 'length').toLowerCase();

        const errors: string[] = [];
        if (!value && !hasRequired()) return errors;
        if (type == 'length') {
            if (get(value, 'length', 0) < num) {
                if (Array.isArray(value)) {
                    errors.push('You need to at least select ' + num + ' ' + (validationName || name));
                } else {
                    errors.push((validationName || name) + ' must be at least ' + num + ' characters long.');
                }
            }
        } else if (type == 'value') {
            if (value && parseFloat(value) < num) {
                errors.push((validationName || name) + ' must be at least ' + num + '.');
            }
        }
        return errors;
    }
    const isMax = (validation: string) => {//2 types available - value & length
        const tmpValidation = validation ? validation.split(',') : [];
        const num = get(tmpValidation, '[0]', 1); //Number
        let type = get(tmpValidation, '[1]', 'length').toLowerCase();

        const errors: string[] = [];
        if (!value && !hasRequired()) return errors;
        if (type == 'length') {
            if (get(value, 'length', 0) > num) {
                if (Array.isArray(value)) {
                    errors.push('You can maximum select ' + num + ' ' + (validationName || name));
                    // You can maximum select 2 documents
                } else {
                    errors.push((validationName || name) + ' must be less than or equal to ' + num + ' characters long.');
                }
            }
        } else if (type == 'value') {
            if (value && parseFloat(value) > num) {
                errors.push((validationName || name) + ' must be less than or equal to ' + num + '.');
            }
        }
        return errors;
    }
    const isBetween = (validation: string) => {
        const errors: string[] = [];

        const tmpValidation = validation ? validation.split(',') : [];
        const num1 = get(tmpValidation, '[0]', 1); //Number 1
        const num2 = get(tmpValidation, '[1]', 1); //Number 2

        let type = get(tmpValidation, '[2]', 'length').toLowerCase();
        if (!value && !hasRequired()) return errors;
        if (type == 'length') {
            if (get(value, 'length', 0) < num1 || get(value, 'length', 0) > num2) {
                if (Array.isArray(value)) {
                    errors.push('You need at least ' + num1 + ' to ' + num2 + ' ' + (validationName || name));
                    //You need at least 2 to 3 documents.
                } else {
                    errors.push((validationName || name) + ' must be between ' + num1 + ' to ' + num2 + ' characters long.');
                }
            }
        } else if (type == 'value') {
            if (value && (parseFloat(value) < num1 || parseFloat(value) > num2)) {
                errors.push((validationName || name) + ' must be between ' + num1 + ' to ' + num2 + '.');
            }
        }
        return errors;
    }
    const isUrl = () => {
        const regEx = /^(((ftp|http|https):\/\/)|(\/)|(..\/))(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
        const errors: string[] = [];
        if (value && !regEx.test(value)) {
            errors.push('Please include a valid url.');
        }
        return errors;
    }
    const hasMime = (validation: string) => {
        const tmpValidation = validation ? validation.split(',') : []; //mime types
        const errors: string[] = [];
        let hasErrors = false;
        if (value && value.length > 0) {
            value.map((file: File) => {
                const mimeIdx = tmpValidation.indexOf(file.type);
                if (mimeIdx === -1) {
                    hasErrors = true;
                }
            });
        }
        if (hasErrors) {
            errors.push((validationName || name) + ' must be of the type: ' + validation);
        }
        return errors;
    }
    // - Rules Ends Here --

    //HELPER FUNCTIONS
    const hasRequired = () => {
        if (validation && validation?.includes('required')) {
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
                          containerStyle={containerStyle}
                          maskPlaceholder={maskPlaceholder}
                          maskFormat={maskFormat}
                          autocomplete={autocomplete}
                      />
                  // : type == 'date' ?
                  // <DatePicker
                  //   name={name}
                  //   defaultValue={defaultValue}
                  //   hasError={errors && errors.length > 0 ? true : false}
                  //   onChange={(value) => onInputChange(value)}
                  //   onBlur={onInputBlur}
                  //   disabled={disabled}
                  //   minDate={minDate}
                  //   maxDate={maxDate}
                  // />
                // : type == 'time' ?
                //     <TimePicker
                //         name={name}
                //         hasError={errors && errors.length > 0 ? true : false}
                //         onChange={(value) => onInputChange(value)}
                //         onBlur={onInputBlur}
                //         defaultValue={defaultValue}
                //         disabled={disabled}
                //         readonly={readOnly}
                //     />
                // : type == 'datetime' ?
                //     <DateTimePicker
                //         name={name}
                //         hasError={errors && errors.length > 0 ? true : false}
                //         onChange={(value) => onInputChange(value)}
                //         onBlur={onInputBlur}
                //         defaultValue={defaultValue}
                //         disabled={disabled}
                //         readonly={readOnly}
                //     />
                // : type == 'checkbox' ?
                //     <CheckBox
                //         name={name}
                //         label={label}
                //         onBlur={onInputBlur}
                //         defaultValue={defaultValue as any}
                //         onChange={(value) => onInputChange(value)}
                //         labelPosition={labelPosition}
                //         disabled={disabled}
                //         inputClassName={inputClassName}
                //     />
                // : type == 'radio' ?
                //     <RadioInput
                //         name={name}
                //         onChange={(value) => onInputChange(value)}
                //         hasError={errors && errors.length > 0 ? true : false}
                //         options={options ? options : []}
                //         defaultValue={defaultValue}
                //         disabled={disabled}
                //         onBlur={onInputBlur}
                //         inline={inline}
                //         labelPosition={labelPosition}
                //     />
                // : type == 'textarea' ?
                //     <TextArea
                //         name={name}
                //         placeholder={placeholder}
                //         disabled={disabled}
                //         readonly={readOnly}
                //         onChange={(value) => onInputChange(value)}
                //         onBlur={onInputBlur}
                //         hasError={errors && errors.length > 0 ? true : false}
                //         rows={rows}
                //         cols={cols}
                //         defaultValue={defaultValue}
                //     />
                // : type == 'file' ?
                //     <FileInput
                //         name={name}
                //         type={fileType ? fileType : 'file'}
                //         hasPreview={hasPreview ? hasPreview : true}
                //         accept={mimeAccept}
                //         multiple={multiple}
                //         onChange={(files: any) => onInputChange(files)}
                //     />
                // : type == 'select' ?
                //     <ComboBox
                //         name={name}
                //         model={model}
                //         query={query}
                //         searchField={searchField}
                //         disabled={disabled}
                //         readonly={readOnly}
                //         multiple={multiple}
                //         onBlur={onInputBlur}
                //         placeholder={placeholder}
                //         options={options}
                //         defaultValue={defaultValue}
                //         containerBackground={containerBackground}
                //         containerTextColor={containerTextColor}
                //         onChange={(value) => onInputChange(value)}
                //         hasError={errors && errors.length > 0 ? true : false}
                //     />
                // : type == 'createable-select' ?
                //     <CreateableComboBox
                //         name={name}
                //         options={options}
                //         placeholder={placeholder}
                //         readonly={readOnly}
                //         onChange={(value) => onInputChange(value)}
                //         onBlur={onInputBlur}
                //         multiple={multiple}
                //         disabled={disabled}
                //         defaultValue={defaultValue}
                //         hasError={errors && errors.length > 0 ? true : false}
                //     />

                // : type == 'date-range' ?
                //     <DateRangePicker
                //         name={name}
                //         defaultValue={defaultValue as any}
                //         disabled={disabled}
                //         useRange={true}
                //         readonly={readOnly}
                //         asSingle={false}
                //         onChange={(value: any) => onInputChange(value)}
                //         hasError={errors && errors.length > 0 ? true : false}
                //     />
                // : type == 'submit' ?
                //     <PrimaryButton
                //         name={name}
                //         isLoading={buttonLoading}
                //         type={'submit'}
                //         theme={buttonTheme ? buttonTheme : 'primary'}
                //     />
                // : type == 'reset' ?
                //     <PrimaryButton
                //         name={name}
                //         type={'reset'}
                //         theme={buttonTheme ? buttonTheme : 'primary'}
                //     />
                // : type == 'rich-text-editor' ?
                //     <RichTextEditor
                //         readonly={readOnly}
                //         disabled={disabled}
                //         name={name}
                //         defaultValue={defaultValue}
                //         onChange={(value: string) => onInputChange(value)}
                //         hasError={errors && errors.length > 0 ? true : false}
                //     />
                : null
            }
            {
                hint ?
                    <span className="text-gray text-sm" style={{ color: '#a9a9a9' }}>{hint}</span> : null
            }
            {
                errors && errors.length > 0 ?
                    <div className="text-red-700">
                        {
                            errors.map((error, idx) => (
                                <p key={name + idx} style={{ marginBottom: '2px', marginTop: 0 }}>{error}</p>
                            ))
                        }
                    </div>
                    : null
            }

        </div>
    )
});
export default AFormInput;