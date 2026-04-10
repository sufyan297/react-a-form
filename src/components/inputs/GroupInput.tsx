import React, {
    ReactElement,
    useEffect,
    useRef,
    useState,
} from 'react';
import { IFile } from '../../types';

interface IGroupInputProps {
    name: string;
    repeatable?: boolean;
    children?: ReactElement<any> | ReactElement<any>[];
    onChange?: (val: { [key: string]: any }[]) => void;
    addLabel?: string;
    defaultValue?: any;
    value?: any;
    handleChange?: (name: string, value: string | string[] | boolean | IFile[] | { [key: string]: any }[] | any) => void;
    collectChildRef?: (ref: React.RefObject<any>, fieldName: string) => void;
    inputClassName?: string;
    containerClassName?: string;
}

const GroupInput: React.FC<IGroupInputProps> = ({
    name,
    repeatable = false,
    children,
    onChange,
    defaultValue,
    value,
    handleChange,
    collectChildRef,
    inputClassName,
    containerClassName,
    addLabel = "+ Add More"
}) => {
    const normalizeGroupValues = (inputValue: any) => {
        if (Array.isArray(inputValue) && inputValue.length > 0) {
            return inputValue.map((item) => ({ ...(item || {}) }));
        }
        if (inputValue) {
            return [{ ...(inputValue || {}) }];
        }
        return [{}];
    };

    if (!children) {
        throw new Error("Please provide children in group");
    }

    const normalizedOriginal = Array.isArray(children) ? children : [children];
    const resolvedValue = value !== undefined ? value : defaultValue;
    const keySeedRef = useRef(0);
    const groupValuesRef = useRef<{ [key: string]: any }[]>(normalizeGroupValues(resolvedValue));
    const createGroupKey = (idx: number) => {
        keySeedRef.current += 1;
        return `${idx}-${keySeedRef.current}`;
    };

    const [childKeys, setChildKeys] = useState<string[]>(() => {
        const groups = resolvedValue?.length > 0 ? resolvedValue.length : 1;
        return Array.from({ length: groups }).map(
            (_, idx) => createGroupKey(idx)
        );
    });

    const [groupValues, setGroupValues] = useState<{ [key: string]: any }[]>(
        normalizeGroupValues(resolvedValue)
    );

    useEffect(() => {
        const nextValues = normalizeGroupValues(resolvedValue);
        setGroupValues(nextValues);
        groupValuesRef.current = nextValues;
        setChildKeys((prev) => {
            if (prev.length === nextValues.length) {
                return prev;
            }
            if (prev.length > nextValues.length) {
                return prev.slice(0, nextValues.length);
            }
            const appendedKeys = Array.from({ length: nextValues.length - prev.length }).map(
                (_, idx) => createGroupKey(prev.length + idx)
            );
            return [...prev, ...appendedKeys];
        });
    }, [resolvedValue]);

    const onAddMore = () => {
        const newKey = createGroupKey(childKeys.length);
        const updatedValues = [...groupValuesRef.current, {}];
        setChildKeys((prev) => [...prev, newKey]);
        groupValuesRef.current = updatedValues;
        setGroupValues(updatedValues);
        onChange?.(updatedValues);
        handleChange?.(name, updatedValues);
    };

    const removeGroupAt = (index: number) => {
        const updatedKeys = childKeys.filter((_, i) => i !== index);
        const updatedValues = groupValues.filter((_, i) => i !== index);

        setChildKeys(updatedKeys);
        setGroupValues(updatedValues);
        groupValuesRef.current = updatedValues;

        onChange?.(updatedValues);
        handleChange?.(name, updatedValues);
    };


    const handleGroupChange = (groupIndex: number, fieldName: string, value: any) => {
        const updated = [...groupValuesRef.current];
        updated[groupIndex] = {
            ...updated[groupIndex],
            [fieldName]: value,
        };
        groupValuesRef.current = updated;
        setGroupValues(updated);
        const newUpdated = repeatable ? updated : updated[0];
        handleChange && handleChange(name, newUpdated);
    };

    return (
        <div className="space-y-4">
            {childKeys.map((key, index) => (
                <div key={key} className={`relative border p-4 rounded ${containerClassName}`}>
                    {childKeys.length > 1 && repeatable && (
                        <button
                            onClick={() => removeGroupAt(index)}
                            type="button"
                            className="absolute top-1 right-1 text-gray-400 hover:text-red-600 w-6 h-6 flex items-center justify-center border border-gray-200 rounded-full"
                            aria-label="Remove"
                        >
                            <svg
                                className="w-[14px] h-[14px]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    <div>
                        {normalizedOriginal.map((child) => {
                            const injectDefaults = (
                                el: React.ReactNode
                            ): React.ReactNode => {
                                if (!React.isValidElement(el)) return el;

                                const fieldName = el.props?.name;
                                const valueMap = groupValues[index] || {};

                                const props: any = {
                                    onChange: (e: any) => {
                                        const name = e?.target?.name ?? fieldName;
                                        const value = e?.target?.value ?? e;
                                        handleGroupChange(index, name, value);
                                    },
                                    onBlur: () => {
                                        const currentValues = groupValuesRef.current;
                                        onChange?.(currentValues);
                                        const newValues = repeatable ? currentValues : currentValues[0];
                                        handleChange?.(name, newValues);
                                    },
                                    uniqueId: `${index}`,
                                    id: `${name}-${index}`
                                };

                                const originalRef = (el as any).ref;
                                props.ref = (instance: any) => {
                                    if (fieldName && instance) {
                                        collectChildRef?.({ current: instance }, `${fieldName}-${index}`);
                                    }

                                    // preserve original ref
                                    if (typeof originalRef === "function") {
                                        originalRef(instance);
                                    } else if (originalRef && typeof originalRef === "object") {
                                        originalRef.current = instance;
                                    }
                                };

                                // passes ref of newly created to the inputRefs
                                // Inject current child value so grouped inputs stay visually in sync
                                if (fieldName && valueMap[fieldName] !== undefined) {
                                    props.value = valueMap[fieldName];
                                    props.defaultValue = valueMap[fieldName]; // Also fallback for uncontrolled
                                }

                                if (el.props?.children) {
                                    props.children = React.Children.map(el.props.children, injectDefaults);
                                }

                                return React.cloneElement(el, props);
                            };

                            return injectDefaults(child);
                        })}
                    </div>
                </div>
            ))}

            {
                repeatable && (
                    <button
                        onClick={onAddMore}
                        type="button"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-white border border-gray-200 hover:bg-primary rounded-lg hover:bg-gray-700 transition-all duration-200 ${inputClassName}`}
                    >
                        {addLabel}
                    </button>
                )
            }

        </div>
    );
};

export default GroupInput;
