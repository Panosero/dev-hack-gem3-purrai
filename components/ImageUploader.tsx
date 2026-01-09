import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, FlaskConical, Scan } from 'lucide-react';

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
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div
        className={`relative group flex flex-col items-center justify-center w-full h-80 rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
          ${dragActive ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-orange-500/50'}
          ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Animated Corner Brackets */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-600 group-hover:border-orange-500 transition-colors"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-600 group-hover:border-orange-500 transition-colors"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-600 group-hover:border-orange-500 transition-colors"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-600 group-hover:border-orange-500 transition-colors"></div>

        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept="image/*"
          disabled={isAnalyzing}
        />
        
        {preview ? (
          <div className="w-full h-full relative">
              <img src={preview} alt="Uploaded Cat" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <div className="relative mb-4">
                <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <Scan className="w-16 h-16 text-orange-500 relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <p className="text-xl font-bold text-slate-200 mb-2 font-mono">INITIALIZE SUBJECT SCAN</p>
            <p className="text-sm">Drag & drop visual intel or click to browse</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
            <p className="font-bold text-lg animate-pulse font-mono uppercase tracking-widest text-orange-400">Processing Data...</p>
            <div className="w-48 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-orange-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
            </div>
            <style>{`
                @keyframes loading {
                    0% { width: 0%; transform: translateX(-100%); }
                    100% { width: 100%; transform: translateX(100%); }
                }
            `}</style>
          </div>
        )}
      </div>

      {onUseSample && !isAnalyzing && (
        <button 
            onClick={onUseSample}
            className="w-full glass-button py-3 rounded-xl font-bold text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 group"
        >
            <FlaskConical className="w-4 h-4 group-hover:text-orange-400 transition-colors" />
            No subject? Load Test Subject "Whiskey"
        </button>
      )}
    </div>
  );
};

export default ImageUploader;