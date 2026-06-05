import React, { useRef, useState } from "react";
import "./FileUpload.css";

export interface IFileUploadProps {
  accept: string;
  helperText: string;
  uploadIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  dropIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  onFileChange: (file: File | null) => void;
  value?: File | null;
  disabled?: boolean;
}

const FileUpload = ({
  accept,
  helperText,
  uploadIcon: UploadIcon,
  dropIcon: DropIcon,
  onFileChange,
  value,
  disabled = false,
}: IFileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    onFileChange(file);
  };

  return (
    <div
      className={`upload-box ${
        isDragging ? "dragging" : ""
      } ${disabled ? "disabled" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();

        if (!disabled) {
          setIsDragging(true);
        }
      }}
      onDragLeave={() => {
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const file = e.dataTransfer.files?.[0] || null;
        handleFile(file);
      }}
    >
      {value && (
        <button
          type="button"
          className="remove-file-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            handleFile(null);

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        >
          ✕
        </button>
      )}

      <input
        ref={fileInputRef}
        hidden
        id="file-upload"
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0] || null;

          handleFile(file);

          // يسمح باختيار نفس الملف مرة أخرى
          e.target.value = "";
        }}
      />

      <label htmlFor="file-upload" className="upload-content">
        <div className="upload-icon">
          {isDragging && DropIcon ? <DropIcon /> : <UploadIcon />}
        </div>

        {value ? (
          <>
            <p className="upload-title">{value.name}</p>

            <p className="upload-subtitle">
              Click to select another file
            </p>
          </>
        ) : (
          <>
            <p className="upload-title">
              {isDragging
                ? "Drop file here"
                : "Click to upload or drag and drop"}
            </p>

            <p className="upload-subtitle">{helperText}</p>
          </>
        )}
      </label>
    </div>
  );
};

export default FileUpload;