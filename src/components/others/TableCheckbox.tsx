import React from 'react';

interface IProps {
    indeterminate?: boolean;
    id?: string;
    value?: string;
    checked?: boolean;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const TableCheckBox: React.ForwardRefRenderFunction<HTMLInputElement, IProps> = ({ indeterminate = false, onChange, className, disabled, ...rest }, ref) => {
    const defaultRef = React.useRef<HTMLInputElement>();
    const resolvedRef = (ref || defaultRef) as React.MutableRefObject<HTMLInputElement>;

    React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
        <>
            <input type='checkbox' 
                // className={`w-5 h-5 mt-2 accent-primary text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray ${className}`} 
                className="!form-checkbox w-5 h-5 accent-primary !rounded border-light"
                ref={resolvedRef}
                disabled={disabled}
                onChange={(e) => onChange ? onChange(e) : null}
                {...rest} 
            />
        </>
    );
};
export default React.forwardRef(TableCheckBox);