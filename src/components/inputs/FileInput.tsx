import React, { ChangeEvent, FC, useRef, useState } from 'react';
import { IFile } from '../../types';
import { map } from 'lodash';

interface FileInputProps {
    multiple?: boolean;
    name: string;
    type: 'file' | 'image';
    onChange?: (files: IFile[]) => void;
    accept?: string;
}

const fileIcon = (size: number) => 
<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className="bi bi-file-earmark-plus" viewBox={`0 0 ${size} ${size}`}>
    <path d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5z"/>
    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
</svg>;
const removeIcon = (size: number) => 
<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className="bi bi-x-circle-fill text-red-700" viewBox={`0 0 ${size} ${size}`}>
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
</svg>;

const FileInput: FC<FileInputProps> = ({ name, multiple, onChange, accept }) => {//type,
    //States
    const [files, setFiles] = useState<IFile[]>([]);
    const [fileKey, setFileKey] = useState<number>(0);
    const fileInputRef = useRef<HTMLDivElement>(null);

    //Methods
    const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const tmpFiles = e.target.files;
        const newFiles: IFile[] = [];
        if (tmpFiles) {
            map(tmpFiles, (file) => {
                newFiles.push({
                    file: file,
                    name: file.name,
                    url: URL.createObjectURL(file),
                    type: file.type,
                    hasPreview: file.type.indexOf('image') > -1 ? true : false
                })
            });
            let finalFiles = multiple ? [...files, ...newFiles] : [...newFiles];
            setFiles(finalFiles);
            onChange ? onChange(finalFiles) : null;
            setFileKey((prev) => prev + 1);
        }
    }

    const onFileRemove = (index: number) => {
        const newFiles = [...files]
        newFiles.splice(index, 1);
        setFiles(newFiles);
        setFileKey((prev) => prev + 1);
        console.log(newFiles)
    }

    const handleDropEnter = () => {
        if (fileInputRef.current) {
            fileInputRef.current.style.backgroundColor = '#e6f2ff';
            fileInputRef.current.style.border = '2px dashed #3769b0';
        }
    };

    const handleDropLeave = () => {
        if (fileInputRef.current) {
            fileInputRef.current.style.backgroundColor = '#ffffff';
            fileInputRef.current.style.border = '2px dashed #c4ccd3';
        }
    };

    const handleDrop = () => {
        if (fileInputRef.current) {
            fileInputRef.current.style.backgroundColor = '#ffffff';
            fileInputRef.current.style.border = '2px dashed #c4ccd3';
        }
    };
    return (
        <div className='relative mt-2'>
            <div className={`flex justify-center items-center border-dashed rounded-md border-2 p-5 transition-all duration-300 hover:border-primary`} 
                ref={fileInputRef} 
                onDragEnter={handleDropEnter} 
                onDragLeave={handleDropLeave} 
                onDrop={handleDrop}
            >
                <input className={`absolute p-3 cursor-pointer w-full h-full opacity-0`}
                    type="file"
                    id={name}
                    key={fileKey}
                    onChange={onFileInputChange}
                    multiple={multiple}
                    accept={accept}
                />
                {fileIcon(18)}
                <p className={'font-primary mx-2'}>Drop your file here, Or click to browse</p>
            </div>

            <div>
                {
                    files && files.length > 0 ?
                        <ul className="p-0 mt-5">
                            {
                                files.map((file, idx) => (
                                    <li className={`mt-5 list-none border-1 border-slate-700 rounded-md transition-all duration-300`} key={idx}>
                                        <div className="flex justify-between items-center align-center">
                                            <div className='flex content-between items-center justify-center '>
                                                <div className="flex justify-center mx-3 align-center">
                                                    {
                                                        file.hasPreview ? <img src={file.url} className={`h-16 w-16 rounded-md transition-all object-cover duration-300 hover:scale-125`} /> : fileIcon(24)
                                                    }
                                                </div>
                                                <div>
                                                    <p className='text-center mb-0 text-sm'>
                                                        {file.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <a className="file-remove" onClick={() => onFileRemove(idx)}>
                                                {removeIcon(18)}
                                            </a>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                        : null
                }
            </div>
        </div>
    )
}
export default FileInput;