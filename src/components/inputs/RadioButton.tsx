import React, { ChangeEvent } from 'react';
import { ISelect } from '../../types';

interface IProps {
  name: string;
  disabled?: boolean;
  labelPosition?: 'prefix' | 'postfix';
  inline?: boolean;
  options: ISelect[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  defaultValue?: string;
  hasError: boolean;
}

const RadioButton: React.FC<IProps> = ({ name, disabled, options, onChange, onBlur, defaultValue, hasError, labelPosition, inline }) => {

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange ? onChange(e.target.value) : null;
  };

  const handleBlur = () => {
    onBlur ? onBlur() : null;
  };

  return (
    <div className={inline ? 'flex':''}>
      {options.map((item, index) => {
        return (
          <div className="flex" key={name + '-' + index}>
            <div className="mr-3">
              <label
                className='cursor-pointer leading-2'
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {labelPosition == 'prefix' ? (
                  <p
                    className='pr-2'
                    style={{ marginBottom: '0' }}
                  >
                    {item.label}
                  </p>
                ) : null}

                <input
                  className={`h-5 w-5 text-xl align-bottom duration-300 transition-all accent-primary ${disabled === true ? 'bg-gray-200 border-0 rounded-lg cursor-not-allowed' : 'bg-white inline cursor-pointer'}`}
                  style={{ ...(hasError ? { border: '1px solid red' } : null), }}
                  disabled={disabled}
                  key={index}
                  onChange={handleOnChange}
                  defaultValue={defaultValue}
                  name={name}
                  type={'radio'}
                  value={item.value}
                  onBlur={handleBlur}
                  defaultChecked={item.value == defaultValue ? true : false}
                />
                {labelPosition != 'prefix' ? (
                  <p
                    className='pl-2'
                    style={{ marginBottom: '0' }}
                  >
                    {item.label}
                  </p>
                ) : null}
              </label>
            </div>
          </div>
        );
      })}
    </div>
  )
}
export default RadioButton;