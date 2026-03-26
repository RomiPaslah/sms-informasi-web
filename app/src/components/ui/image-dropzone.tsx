import { useRef, useState } from 'react';
import { FolderUp } from 'lucide-react';

interface ImageDropzoneProps {
  title: string;
  description: string;
  message?: string;
  onFileSelect: (file: File) => void | Promise<void>;
}

export function ImageDropzone({
  title,
  description,
  message,
  onFileSelect,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) {
      return;
    }

    await onFileSelect(file);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        void handleFiles(e.dataTransfer.files);
      }}
      className={`rounded-2xl border border-dashed p-4 transition-all ${
        isDragging
          ? 'border-[#d90429] bg-[#d90429]/5'
          : 'border-gray-300 dark:border-gray-700'
      }`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#d90429] px-4 py-3 text-sm font-medium text-white hover:bg-[#ef233c]">
          <FolderUp className="h-4 w-4" />
          Pilih File
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </label>
      </div>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Seret dan lepas gambar ke area ini untuk upload cepat.
      </p>
      {message && <p className="mt-3 text-sm text-green-600 dark:text-green-400">{message}</p>}
    </div>
  );
}
