import React, { CSSProperties } from 'react';
import Loading from '../shared/Loading';
interface IProps {
    type?: 'button' | 'submit';
    disabled?: boolean;
    children: React.ReactNode | string;
    className?: string;
    loading?: boolean;
    style?: CSSProperties;
}
const AButton: React.FC<IProps> = ({ type = 'button', children, className, style, disabled, loading }) => {
    return (
        <button type={type} style={{...style, ...loading ? { opacity: 0.7 } : null}} disabled={disabled || loading} className={`rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${className}`}>
            {
                loading ?
                <div className='flex items-center justify-center'>
                    <Loading />
                </div>
                :
                children
            }
        </button>
    )
}
export default AButton;