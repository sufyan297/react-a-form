import React, { FC, isValidElement, useEffect, useState, FormEvent, ReactElement, JSXElementConstructor } from 'react';
import { get, map } from 'lodash';

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
    const [ errors, setErrors ] = useState<any>({});
    const [ refreshKey, setRefreshKey ] = useState(0);

    useEffect(() => {
        if (!formLoading) { //if FormLoading is used and when it is False
            setFormData({...values});
        }
    }, [formLoading]);

    useEffect(() => {
        if (values) {
            setFormData({...formData, ...values});
            setErrors({});
            setRefreshKey((prev) => prev + 1);
            // console.log("NEW VALUES ARRIVED: ", values);
        }
    }, [values]);

    // Expose the internal state through the ref
    useEffect(() => {
        if (forwardedRef) {
            forwardedRef.current = {
                getFormData: () => formData,
                setFormData: (newValues: any) => setFormData(newValues),
            };
        }
    }, [formData, forwardedRef]);

    let tErrors: {[key: string]: any} = {};

    //Methods
    const handleChange = (name: string, value: string) => {
        // console.log("NAME: ", name);
        // console.log("VALUE: ", value)
        let tmpFormData = {
            ...formData,
            [name]: value
        };
        setFormData(tmpFormData);
    }

    const handleValidation = (name: string, newErrors: string[]) => {
        // console.log("VALIDATION : ", name, newErrors);
        const tmpErrors = {
            ...errors,
            [name]: newErrors
        }
        tErrors = {...errors, [name]: newErrors};
        setErrors(tmpErrors);
    }

    const handleRemove = (name: string) => {
        const tmpErrors = {
            ...errors,
            [name]: []
        }
        setErrors(tmpErrors);
        const inputIndex = inputRefs.findIndex((input) => input.name == name);
        inputRefs.splice(inputIndex, 1); //remove reference
    }

    //Constants
    const arrChildren = Array.isArray(children) ? children : [children];
    const inputRefs: any[] = [];

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
                newChildrens.push({
                    ...child,
                    props: {
                        ...child.props,
                        ...child.props && child.props.type && child.props.type === 'group' ? {
                            collectChildRef: (childRef: React.RefObject<any>, fieldName: string) => {
                                // here *we* have access to inputRefs, so we push every grouped child's ref
                                if(fieldName !== undefined){
                                    // console.log("it calles", fieldName, "      ", childRef);
                                    inputRefs.push({ name: `${fieldName}`, ref: childRef });
                                }
                            }, handleChange: handleChange, defaultValue: formData && formData[inputName] ? formData[inputName] : undefined
                        } : undefined,
                        children: mapChildren(child.props.children, index)
                    }
                });
            } else if (child && child.props && child.props.name && child.props.type && types.includes(child.props.type)) {
                // console.log("FInal object", child)
                const inputName: string = child.props.name;
                const inputRef = React.createRef();
                newChildrens.push(
                    isValidElement(child) ? React.cloneElement(child as React.ReactElement, { key: index, ref: inputRef, handleChange: handleChange, onValidate: handleValidation, removeElement: handleRemove, defaultValue: formData && formData[inputName] ? formData[inputName] : undefined }) : null
                );
                inputRefs.push({name: inputName, ref: inputRef});
                // console.log("this is input ref for ", inputName, "    --    ", inputRef);
            } else {
                newChildrens.push(child);
            }
        }
        return newChildrens;
    }
    
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        inputRefs.map((input) => {
            const { ref } = input;
            if (input && input.ref) {
                ref.current?.handleValidation();
            }
        });
        
        // console.log("ERRORS: ", tErrors);
        setTimeout(() => {
            let hasErrors = false;
            map(tErrors, (error: any) => {//errors
                if (get(error, 'length', 0) > 0) {
                    hasErrors = true;
                }
            });
            if (!hasErrors) {
                onSubmit ? onSubmit(formData) : null;
            }
        }, 250)
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
        <form key={refreshKey} name={name ? name : 'a-form'} onSubmit={handleSubmit} className={`a-form ` + className}>
            {mapChildren(arrChildren)}
            {/* Errors: {JSON.stringify(errors)} */}
            {/* Form Values: {JSON.stringify(formData)} <br/>
            <button type={'button'} onClick={handleSubmit}>Submit</button> */}
            {/* <button type={'submit'}></button> */}
        </form>
    )
}

export default AForm;