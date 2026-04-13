import React, { FC, FormEvent, JSXElementConstructor, ReactElement, isValidElement, useCallback, useEffect, useRef, useState } from 'react';
import { get, isEqual, map } from 'lodash';

interface IProps {
    name?: string;
    children: React.ReactNode | React.ReactNode[] | React.ReactElement | ReactElement<any, string | JSXElementConstructor<any>>; 
    values?: any; //It will be object
    onSubmit?: (values: any) => void;
    className?: string;
    formLoading?: boolean;
    forwardedRef?: {
        current: {
            getFormData: () => any;
            setFormData: (values: any) => any;
        }
    };
}

const types = ['text', 'password', 'number', 'date', 'time', 'datetime', 'email', 'url', 'textarea', 'file', 'image', 'radio', 'checkbox', 'select', 'submit', 'createable-select', 'date-range', 'rich-text-editor', 'toggle', 'group'];
const AForm: FC<IProps> = ({ name, children, values, onSubmit, className, formLoading = false, forwardedRef }) => {

    //States
    const [ formData, setFormData ] = useState<any>({ ...values });
    const setErrors = useState<any>({})[1];
    const inputRefs = useRef<Record<string, React.RefObject<any>>>({});
    const errorsRef = useRef<any>({});
    const appliedValuesRef = useRef<any>(values ? { ...values } : undefined);

    useEffect(() => {
        if (formLoading || !values) {
            return;
        }
        const hasMeaningfulValueChange = !isEqual(appliedValuesRef.current, values);
        if (!hasMeaningfulValueChange) {
            return;
        }
        appliedValuesRef.current = { ...values };
        setFormData((prev: any) => ({ ...prev, ...values }));
        setErrors({});
        errorsRef.current = {};
    }, [formLoading, values]);

    // Expose the internal state through the ref
    useEffect(() => {
        if (forwardedRef) {
            forwardedRef.current = {
                getFormData: () => formData,
                setFormData: (newValues: any) => {
                    appliedValuesRef.current = {
                        ...(appliedValuesRef.current || {}),
                        ...newValues
                    };
                    setFormData((prev: any) => ({ ...prev, ...newValues }));
                },
            };
        }
    }, [formData, forwardedRef]);

    //Methods
    const handleChange = useCallback((name: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleValidation = useCallback((name: string, newErrors: string[]) => {
        setErrors((prev: any) => {
            const prevErrors = prev?.[name] ?? [];
            const hasSameErrors =
                prevErrors.length === newErrors.length &&
                prevErrors.every((error: string, index: number) => error === newErrors[index]);

            if (hasSameErrors) {
                return prev;
            }
            const tmpErrors = {
                ...prev,
                [name]: newErrors
            };
            errorsRef.current = tmpErrors;
            return tmpErrors;
        });
    }, []);

    const handleRemove = useCallback((name: string) => {
        setErrors((prev: any) => {
            const prevErrors = prev?.[name] ?? [];
            if (prevErrors.length === 0) {
                return prev;
            }
            const tmpErrors = {
                ...prev,
                [name]: []
            };
            errorsRef.current = tmpErrors;
            return tmpErrors;
        });
        delete inputRefs.current[name];
    }, []);

    //Constants
    const arrChildren = Array.isArray(children) ? children : [children];

    const getInputRef = (fieldKey: string) => {
        if (!inputRefs.current[fieldKey]) {
            inputRefs.current[fieldKey] = React.createRef();
        }
        return inputRefs.current[fieldKey];
    };

    const hasFieldValue = (fieldName: string) => Object.prototype.hasOwnProperty.call(formData || {}, fieldName);

    const mapChildren = (childrens: React.ReactNode | React.ReactNode[], index?: number) => {
        const newChildrens: React.ReactNode[] = [];
        // console.log("Childrens: ", typeof childrens, childrens)
        if (Array.isArray(childrens)) {
            childrens.map((child: any, idx) => {
                // if (child)
                // console.log("CHILD: ", child);
                newChildrens.push(
                    mapChildren(child, idx)
                );
            })
        } else {
            // console.log("NOT AN OBJECT", childrens);
            const child: any = childrens;
            if (child && child.props && child.props.children) {
                const inputName: string = child.props.name;
                const isGroupInput = child.props && (child.props as any).type === 'group';
                newChildrens.push(
                    isValidElement(child) ? React.cloneElement(child as React.ReactElement, {
                        ...child.props,
                        ...isGroupInput ? {
                            collectChildRef: (childRef: React.RefObject<any>, fieldName: string) => {
                                if(fieldName !== undefined){
                                    inputRefs.current[fieldName] = childRef;
                                }
                            }, handleChange: handleChange, defaultValue: hasFieldValue(inputName) ? formData[inputName] : undefined
                        } : undefined,
                        children: isGroupInput ? (child.props as any).children : mapChildren((child.props as any).children, index)
                    }) : child
                );
            } else if (child && child.props && child.props.name && child.props.type && types.includes(child.props.type)) {
                const inputName: string = child.props.name;
                const fieldKey = child.props.uniqueId ? `${inputName}-${child.props.uniqueId}` : inputName;
                const inputRef = getInputRef(fieldKey);
                newChildrens.push(
                    isValidElement(child) ? React.cloneElement(child as React.ReactElement, {
                        key: index,
                        ref: inputRef,
                        handleChange: handleChange,
                        onValidate: handleValidation,
                        removeElement: handleRemove,
                        defaultValue: hasFieldValue(inputName) ? formData[inputName] : undefined
                    }) : null
                );
            } else {
                newChildrens.push(child);
            }
        }
        return newChildrens;
    }
    
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const nextErrors: Record<string, string[]> = {};
        const nextFormData = { ...formData };
        Object.entries(inputRefs.current).forEach(([fieldName, ref]) => {
            const fieldErrors = ref.current?.handleValidation?.() ?? [];
            nextErrors[fieldName] = fieldErrors;
            const fieldValue = ref.current?.getValue?.();
            if (fieldValue !== undefined) {
                nextFormData[fieldName] = fieldValue;
            }
        });
        errorsRef.current = nextErrors;
        setErrors(nextErrors);
        setFormData(nextFormData);
        let hasErrors = false;
        map(nextErrors, (error: any) => {
            if (get(error, 'length', 0) > 0) {
                hasErrors = true;
            }
        });
        if (!hasErrors) {
            onSubmit ? onSubmit(nextFormData) : null;
        }
    }

    return (
        formLoading ? 
        <div className='flex items-center justify-center flex-col'>
            <p className='font-bold'>
                Loading Please wait...
            </p>
            <div className="animate-spin">
                <svg style={{ color: 'white' }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 22C17.5228 22 22 17.5228 22 12H19C19 15.866 15.866 19 12 19V22Z" fill="green"></path> <path d="M2 12C2 6.47715 6.47715 2 12 2V5C8.13401 5 5 8.13401 5 12H2Z" fill="green"></path> </svg>
            </div>
        </div>
        :
        <form name={name ? name : 'a-form'} onSubmit={handleSubmit} className={`a-form ` + className}>
            {mapChildren(arrChildren)}
            {/* Errors: {JSON.stringify(errors)} */}
            {/* Form Values: {JSON.stringify(formData)} <br/>
            <button type={'button'} onClick={handleSubmit}>Submit</button> */}
            {/* <button type={'submit'}></button> */}
        </form>
    )
}

export default AForm;
