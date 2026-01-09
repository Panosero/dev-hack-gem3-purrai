import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, FlaskConical } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  isAnalyzing: boolean;
  onUseSample?: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isAnalyzing, onUseSample }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      // Extract base64 data only (remove data:image/jpeg;base64, prefix)
      const base64Data = result.split(',')[1];
      onImageSelected(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-80 rounded-3xl border-4 border-dashed transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
          ${dragActive ? 'border-orange-500 bg-orange-100' : 'border-orange-300 bg-white hover:bg-orange-50'}
          ${isAnalyzing ? 'opacity-80 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept="image/*"
          disabled={isAnalyzing}
        />
        
        {preview ? (
          <img src={preview} alt="Uploaded Cat" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-orange-400">
            <Upload className="w-16 h-16 mb-4" />
            <p className="text-xl font-bold text-orange-500 mb-2">Upload your Cat</p>
            <p className="text-sm">Drag & drop or click to select</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 animate-spin mb-3" />
            <p className="font-bold text-lg animate-pulse">Consulting the Oracle...</p>
          </div>
        )}
      </div>

      {onUseSample && !isAnalyzing && (
        <button 
            onClick={onUseSample}
            className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
            <FlaskConical className="w-4 h-4" />
            No Cat? Load Test Subject
        </button>
      )}
    </div>
  );
};

export default ImageUploader;