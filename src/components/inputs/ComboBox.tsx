import React, { CSSProperties, FC } from 'react';
import Select, { InputActionMeta, MultiValue, SingleValue } from 'react-select'
import { ISelect } from '../../types';
import { debounce } from 'lodash';

interface IProps {
    name: string;
    multiple?: boolean;
    options: ISelect[];
    placeholder?: string;
    onChange?: (value: any) => void;
    onBlur?: () => void;
    defaultValue?: any; //ISelect | ISelect[]
    hasError: boolean;
    loading?: boolean;
    containerStyle?: CSSProperties;
    inputStyle?: CSSProperties;
    disabled?: boolean;
}
const ComboBox: FC<IProps> = ({ onChange, onBlur, disabled, hasError, name, options, multiple, loading, defaultValue, placeholder, containerStyle, inputStyle }) => {
    //Methods
    const onInputChange = (val: string, meta: InputActionMeta) => {
        if (meta.action == 'input-change') {
            console.log("VALUE: ", val);
            //Fetch API / OR / Asked Parent component for Updated Options.
        }
    }
    const handleChange = (item: SingleValue<ISelect> | MultiValue<ISelect>) => {
        console.log("SELECTED ITEM: ", item);
        onChange ? onChange(item) : null;
    }
    const handleBlur = () => {
        onBlur ? onBlur() : null;
    }
    return (
        <Select
            name={name}
            options={options}
            isMulti={multiple ? multiple : false}
            onChange={handleChange}
            onBlur={handleBlur}
            isLoading={loading}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onInputChange={debounce(onInputChange, 500)}
            isDisabled={disabled}
            closeMenuOnSelect={multiple ? false : true}
            styles={{
                control: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 0,
                    marginTop: 4,
                    padding: 1,
                    ...containerStyle
                    // ...containerBackground ? { backgroundColor: containerBackground } : undefined
                }),
                singleValue: (baseStyles) => ({
                    ...baseStyles,
                    ...inputStyle
                    // ...containerTextColor ? { color: containerTextColor } : undefined
                }),
                menu: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 99,
                }),
            }}
            classNames={{
                control: (state) =>
                    !hasError ?
                        state.isFocused ? '!focus:outline-none !focus:ring-none !border-primary !hover:border-primary' : 'border-gray'
                        : '!border-red-700 border-1',
                option: (state) =>
                    state.isFocused && !state.isSelected ? '!bg-primary/50 text-white' : state.isSelected ? '!bg-primary text-white' : ''
            }}
        />
    )
}
export default ComboBox;