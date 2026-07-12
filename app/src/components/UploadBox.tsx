import React, { useState } from 'react';

interface UploadBoxProps {
    onUploadFiles: (files: File[]) => void;
}

/**
 * A glassmorphic drag-and-drop box for uploading multiple spectrophotometer output text files.
 */
function UploadBox({ onUploadFiles }: UploadBoxProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const filesArray = Array.from(e.dataTransfer.files).filter(
                (file) => file.name.endsWith('.txt')
            );
            if (filesArray.length > 0) {
                onUploadFiles(filesArray);
            }
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUploadFiles(Array.from(e.target.files));
        }
    };

    return (
        <div
            className="section animate-fade-in"
            style={{ cursor: 'pointer' }}
            onClick={() => document.getElementById('file-upload-input')?.click()}
        >
            <h3>Upload File</h3>
            <div
                className="drop-zone"
                style={{
                    border: isDragging ? '2px dashed var(--accent-color)' : undefined,
                    background: isDragging ? 'rgba(99, 102, 241, 0.08)' : undefined,
                    transform: isDragging ? 'scale(1.02)' : 'none',
                    transition: 'all 0.2s ease',
                    marginTop: '15px',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    id="file-upload-input"
                    type="file"
                    multiple
                    accept=".txt"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                />
                <p>Drag and drop your file here</p>
                <p style={{ color: 'var(--text-muted)', margin: '5px 0' }}>or</p>
                <button
                    type="button"
                    style={{ pointerEvents: 'none' }}
                >
                    Browse Files
                </button>

            </div>
        </div>
    );
}

export default UploadBox;

