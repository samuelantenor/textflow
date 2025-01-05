import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  accept?: string;
}

export function FileUpload({ onFileSelect, isLoading, accept }: FileUploadProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <label className="cursor-pointer">
      <div className="flex flex-col items-center gap-2 p-8 border-2 border-dashed rounded-lg hover:bg-gray-50">
        <Upload className="h-8 w-8 text-gray-400" />
        <span className="text-sm text-gray-500">
          {isLoading ? "Uploading..." : "Click to upload CSV"}
        </span>
      </div>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={isLoading}
      />
    </label>
  );
}