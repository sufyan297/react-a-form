import React, { FC } from 'react';
interface IProps {
    onChange: () => void;
    containerClassName?: string;
    defaultValue?: boolean;
    label?: string;
    name: string;
}
const ToggleSwitch: FC<IProps> = ({ onChange, containerClassName, defaultValue, label, name }) => {
    return (
        <label className={`relative inline-flex items-center justify-center cursor-pointer ${containerClassName}`}>
            <input type="checkbox" value="" name={name} onChange={() => onChange ? onChange() : null} checked={defaultValue} className="sr-only peer" id={name} />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-0 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            <span className="ml-3 text-sm font-medium text-gray-dark dark:text-gray">{label}</span>
        </label>
    )
}
export default ToggleSwitch;