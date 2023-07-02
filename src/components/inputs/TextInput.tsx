import React, { ChangeEvent, CSSProperties, FC, FocusEvent, useEffect, useState } from 'react';
import styles from './TextInput.module.css';
interface ITextInput {
    type: 'text' | 'number' | 'email' | 'password' | 'url';
    name: string;
    readonly?: boolean;
    disabled?: boolean;
    placeholder?: string;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
    autocomplete?: boolean;
    maxlength?: number;
    defaultValue?: string;
    hasError: boolean;
    iconPosition?: "prefix" | "postfix";
    icon?: string;
    containerStyle?: CSSProperties;
    maskPlaceholder?: string;
    maskFormat?: string;
}

const TextInput: FC<ITextInput> = ({ type, disabled, name, containerStyle, placeholder, maskPlaceholder,  maskFormat, readonly, onBlur, onChange, autocomplete, defaultValue, maxlength, hasError, icon, iconPosition }) => {

    //States
    const [ iPlaceholder, setIPlaceholder] = useState(placeholder);
    const [ iValue, setIValue ] = useState('');

    useEffect(() => {
        if (maskPlaceholder && maskFormat && defaultValue) {
            const newValue = doPlaceholderMasking(defaultValue, maskFormat, maskPlaceholder);
            setIValue(newValue);
        }
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (maskPlaceholder && maskFormat) {
            const val = doPlaceholderMasking(e.target.value, maskFormat);
            // console.log("VALUE: ", val);
            const result = val.replace(/[-()]/g, "");
            // console.log("REPLACE:::", result);
            onChange ? onChange(result) : null;
            doValueMasking(e);
        } else {
            onChange ? onChange(e.target.value) : null;
        }
    }

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        onBlur ? onBlur(e.target.value) : null;
        setIPlaceholder(placeholder);
    }

    const doPlaceholderMasking = (x: string, pattern: string, mask?: string) => {
        var strippedValue = x.replace(/[^0-9]/g, "");
        var chars = strippedValue.split('');
        var count = 0;
      
        var formatted = '';
        for (var i=0; i<pattern.length; i++) {
          const c = pattern[i];
          if (chars[count]) {
            if (/\*/.test(c)) {
              formatted += chars[count];
              count++;
            } else {
              formatted += c;
            }
          } else if (mask) {
            if (mask.split('')[i])
              formatted += mask.split('')[i];
          }
        }
        return formatted;
    }

    const doValueMasking = (e: any) => {
        if (maskFormat && maskPlaceholder) {
            const val = doPlaceholderMasking(e.target.value, maskFormat);
            // console.log("Value Only??", val);
            const newValue = doPlaceholderMasking(e.target.value, maskFormat, maskPlaceholder);
            // console.log("new value: ", newValue);
            setIValue(newValue);
    
            if (e.target.createTextRange) {
                var range = e.createTextRange();
                range.move('character', val.length);
                range.select();
            } else if (e.target.selectionStart) {
                e.target.focus();
                // console.log("setting focus");
                e.target.setSelectionRange(val.length, val.length);
            }
        }
    }

    const onMouseOver = (e: any) => {
        if (maskFormat && maskPlaceholder) {
            const formatted = doPlaceholderMasking(e.target.value, maskFormat, maskPlaceholder);
            setIPlaceholder(formatted);
        }
    }
    const onMouseOut = () => {
        if (maskFormat && maskPlaceholder) {
            setIPlaceholder(placeholder);
        }
    }
    /*
${styles["text-input"]} 
${styles["text-input"]}
    */
    return (
        <div>
            {
                iconPosition == 'prefix' ?
                    <div className='flex align-center'>
                        <i className={`${icon} ml-3 mt-4`} style={{ position: 'absolute' }} ></i>
                        <input
                            style={{ ...hasError ? { outline: '1px solid red' } : null, paddingLeft: '2%', ...containerStyle }}
                            className={`${styles["text-input"]} hover:outline-primary active:outline-primary focus:outline-primary`}
                            type={type}
                            disabled={disabled}
                            id={name}
                            name={name}
                            placeholder={iPlaceholder}
                            readOnly={readonly}
                            onChange={handleChange}
                            defaultValue={defaultValue}
                            value={maskPlaceholder && maskFormat ? iValue : undefined}
                            maxLength={maxlength}
                            onBlur={handleBlur}
                            autoComplete={autocomplete === false ? 'new-password' : ''}
                            onMouseOver={onMouseOver}
                            onMouseOut={onMouseOut}
                            onKeyUp={(e) => maskPlaceholder && maskFormat ? doValueMasking(e) : null}
                            onKeyDown={(e) => maskPlaceholder && maskFormat ? doValueMasking(e) : null}
                        />
                    </div>
                    :
                    <div className='flex align-center justify-end'>
                        <input
                            style={{ ...hasError ? { outline: '1px solid red' } : null, paddingLeft: '2%' }}
                            className={`${styles["text-input"]} hover:outline-primary active:outline-primary focus:outline-primary`}
                            type={type}
                            disabled={disabled}
                            id={name}
                            name={name}
                            placeholder={iPlaceholder}
                            readOnly={readonly}
                            onChange={handleChange}
                            defaultValue={defaultValue}
                            value={maskPlaceholder && maskFormat ? iValue : undefined}
                            maxLength={maxlength}
                            onBlur={handleBlur}
                            autoComplete={autocomplete === false ? 'new-password' : ''}
                            onMouseOver={onMouseOver}
                            onMouseOut={onMouseOut}
                            onKeyUp={(e) => maskPlaceholder && maskFormat ? doValueMasking(e) : null}
                            onKeyDown={(e) => maskPlaceholder && maskFormat ? doValueMasking(e) : null}
                        />
                        <i className={`${icon} mr-3 mt-4`} style={{ position: 'absolute' }} ></i>
                    </ div>
            }
        </div>
    )
}

export default TextInput;