import { CSSProperties, FC, useEffect, useState } from 'react';
import Select, { MultiValue, SingleValue } from 'react-select';
import AsyncSelect from 'react-select/async';
import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/async-creatable';
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
    onSearch?: (text: string) => Promise<ISelect[]>;
    isCreatable?: boolean;
}
const ComboBox: FC<IProps> = ({ onChange, onBlur, disabled, hasError, name, options, multiple, loading, defaultValue, placeholder, containerStyle, inputStyle, onSearch, isCreatable }) => {
    
    const [ newValue, setNewValue ] = useState<ISelect | null | undefined>(defaultValue);
    useEffect(() => {
        if (defaultValue != newValue && onSearch) {
            setNewValue(defaultValue);
        }
    }, [defaultValue]);

    //Methods
    const handleChange = (item: SingleValue<ISelect> | MultiValue<ISelect>) => {
        console.log("SELECTED ITEM: ", item);
        onChange ? onChange(item) : null;
    }
    const handleBlur = () => {
        onBlur ? onBlur() : null;
    }
    // Create a debounced function that returns a promise
    const debouncedOnSearch = debounce(
        (inputValue: string, resolve: (value: ISelect[]) => void) => {
            const result = onSearch ? onSearch(inputValue) : Promise.resolve([]);
            result.then(resolve);
        },
        300 // Debounce delay in milliseconds
    );
    const filterOptions = async (inputValue: string) => {
        const options = await new Promise<ISelect[]>((resolve) => {
            debouncedOnSearch(inputValue, resolve);
        });
        return options.filter((i) =>
            i.label.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    const CustomSelect = isCreatable ? CreatableSelect : Select;
    const CustomAsyncSelect = isCreatable && onSearch ? AsyncCreatableSelect : AsyncSelect;
    return (
        onSearch ?
            <CustomAsyncSelect 
                cacheOptions 
                defaultOptions 
                loadOptions={filterOptions} 
                isMulti={multiple ? multiple : false} isDisabled={disabled} 
                isClearable={isCreatable}
                classNames={{
                    control: (state) =>
                        !hasError ?
                            state.isFocused ? '!focus:outline-none !focus:ring-none !border-primary !hover:border-primary' : 'border-gray'
                            : '!border-red-700 border-1',
                    option: (state) =>
                        state.isFocused && !state.isSelected ? '!bg-primary/50 text-white' : state.isSelected ? '!bg-primary text-white' : '!text-black'
                }}
                onBlur={handleBlur}
                onChange={handleChange}
                placeholder={placeholder}
                defaultValue={newValue}
                value={newValue}
            />
        :
        <CustomSelect
            name={name}
            options={options}
            onChange={handleChange}
            onBlur={handleBlur}
            isLoading={loading}
            defaultValue={defaultValue}
            placeholder={placeholder}
            isDisabled={disabled}
            closeMenuOnSelect={multiple ? false : true}
            isMulti={multiple}
            isClearable={isCreatable}
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
                    state.isFocused && !state.isSelected ? '!bg-primary/50 text-white' : state.isSelected ? '!bg-primary text-white' : '!text-black'
            }}
        />
    )
}
export default ComboBox;