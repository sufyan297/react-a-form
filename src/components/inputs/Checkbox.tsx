import React, { FC } from 'react';
interface IProps {
  onChange: () => void;
  containerClassName?: string;
  inputClassName?: string;
  defaultValue?: boolean;
  label?: string | React.ReactNode;
  name: string;
  disabled?: boolean;
}
const Checkbox: FC<IProps> = ({ onChange, inputClassName, containerClassName, disabled, defaultValue, label, name }) => {
  return (
    <div className={`flex ${containerClassName}`}>
      <div className={`w-5 h-5 pt-0.5 ${inputClassName ? inputClassName : ''}`}>
        <input
          id={name}
          className={`h-5 w-5 rounded-md accent-primary`}
          type={'checkbox'}
          disabled={disabled}
          checked={defaultValue}
          name={name}
          onChange={() => (onChange ? onChange() : null)}
        />
      </div>

      <div className={`pl-2`}>
        {label && typeof label == 'string' ? (
          <label htmlFor={name} className={`text-gray`}>
            {label}
          </label>
        ) : label ? (
          <label htmlFor={name}>{label}</label>
        ) : null}
      </div>
    </div>
  );
};
export default Checkbox;
