import { ChangeEvent, CSSProperties, FC, FocusEvent, useEffect, useState } from 'react';
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
  hasError?: boolean;
  // iconPosition?: "prefix" | "postfix";
  icon?: string;
  containerStyle?: CSSProperties;
  inputStyle?: CSSProperties;
  containerClassName?: string;
  inputClassName?: string;
  maskPlaceholder?: string;
  maskFormat?: string;
  id?: string;
}

const TextInput: FC<ITextInput> = ({
  type,
  disabled,
  name,
  placeholder,
  maskPlaceholder,
  containerStyle,
  inputStyle,
  maskFormat,
  readonly,
  onBlur,
  onChange,
  autocomplete,
  defaultValue,
  maxlength,
  hasError,
  //   icon,
  containerClassName,
  inputClassName,
  id
}) => {
  //States
  const [iPlaceholder, setIPlaceholder] = useState(placeholder);
  const [iValue, setIValue] = useState('');
  const [isVisiblePassword, setVisiblePassword] = useState<boolean>(false);

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
      const result = val.replace(/[-()]/g, '');
      // console.log("REPLACE:::", result);
      onChange ? onChange(result) : null;
      doValueMasking(e);
    } else {
      onChange ? onChange(e.target.value) : null;
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur ? onBlur(e.target.value) : null;
    setIPlaceholder(placeholder);
  };

  const doPlaceholderMasking = (x: string, pattern: string, mask?: string) => {
    var strippedValue = x.replace(/[^0-9]/g, '');
    var chars = strippedValue.split('');
    var count = 0;

    var formatted = '';
    for (var i = 0; i < pattern.length; i++) {
      const c = pattern[i];
      if (chars[count]) {
        if (/\*/.test(c)) {
          formatted += chars[count];
          count++;
        } else {
          formatted += c;
        }
      } else if (mask) {
        if (mask.split('')[i]) formatted += mask.split('')[i];
      }
    }
    return formatted;
  };

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
  };

  const onMouseOver = (e: any) => {
    if (maskFormat && maskPlaceholder) {
      const formatted = doPlaceholderMasking(e.target.value, maskFormat, maskPlaceholder);
      setIPlaceholder(formatted);
    }
  };
  const onMouseOut = () => {
    if (maskFormat && maskPlaceholder) {
      setIPlaceholder(placeholder);
    }
  };
  /*
${styles["text-input"]} 
${styles["text-input"]}
    */
  return (
    <div>
      {
        <div
          style={{ ...containerStyle }}
          className={`input-container flex rounded-md shadow-sm ring-1 ring-inset focus-within:ring-2 focus-within:ring-inset ${
            hasError ? 'ring-red-700 focus-within:ring-red-700' : 'ring-gray-300 hover:ring-primary focus-within:ring-primary'
          } ${containerClassName}`}
        >
          <input
            style={{ ...inputStyle }}
            className={`focus:outline-none block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 ${inputClassName}`}
            type={isVisiblePassword ? 'text' : type}
            disabled={disabled}
            id={id}
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
            onKeyUp={(e) => (maskPlaceholder && maskFormat ? doValueMasking(e) : null)}
            onKeyDown={(e) => (maskPlaceholder && maskFormat ? doValueMasking(e) : null)}
          />
          {/* <i className={`${icon} mr-3 mt-4`} style={{ position: 'absolute' }}></i> */}
          {type == 'password' && (
            <div className='flex justify-center items-center cursor-pointer px-3' onClick={() => setVisiblePassword(!isVisiblePassword)}>
              {isVisiblePassword ? (
                <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='currentColor' className='bi bi-eye' viewBox='0 0 16 16'>
                  <path d='M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z' />
                  <path d='M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0' />
                </svg>
              ) : (
                <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='currentColor' className='bi bi-eye-slash' viewBox='0 0 16 16'>
                  <path d='M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z' />
                  <path d='M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829' />
                  <path d='M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z' />
                </svg>
              )}
            </div>
          )}
        </div>
      }
    </div>
  );
};

export default TextInput;
