import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { MovieIcon } from './icons/MovieIcon';

interface VideoFormProps {
    onSubmit: (imageFile: File, prompt: string, aspectRatio: '16:9' | '9:16') => void;
}

const VideoForm: React.FC<VideoFormProps> = ({ onSubmit }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (file: File | null) => {
        setError(null);
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            setError('Por favor, envie um arquivo de imagem válido (ex: JPG, PNG, WEBP).');
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleDragEvents = useCallback((e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        handleDragEvents(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [handleDragEvents]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) {
            setError("Por favor, envie uma imagem para animar.");
            return;
        }
        if (!prompt.trim()) {
            setError("Por favor, insira um prompt para descrever a animação.");
            return;
        }
        onSubmit(imageFile, prompt, aspectRatio);
    };

    const dragOverClasses = isDragging ? 'border-indigo-400 bg-indigo-500/10 ring-4 ring-indigo-500/20' : 'border-white/20 hover:border-indigo-400/50';

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left side: Image Upload */}
                <div className="w-full">
                    <label
                        htmlFor="image-upload"
                        className={`relative w-full h-64 flex flex-col items-center justify-center border-2 border-dashed ${dragOverClasses} rounded-xl ${imagePreview ? '' : 'cursor-pointer'} transition-all duration-300 ease-in-out overflow-hidden`}
                        onDragEnter={(e) => handleDragEvents(e, true)}
                        onDragLeave={(e) => handleDragEvents(e, false)}
                        onDragOver={(e) => handleDragEvents(e, true)}
                        onDrop={handleDrop}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="Image preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center pointer-events-none">
                                <UploadIcon className={`mx-auto h-12 w-12 text-gray-400 mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`} />
                                <p className="text-lg font-semibold text-gray-200">{isDragging ? "Solte sua imagem aqui!" : "Arraste e solte uma imagem"}</p>
                                <p className="text-gray-400 mt-1">ou <span className="text-indigo-400 font-semibold">clique para procurar</span></p>
                            </div>
                        )}
                        <input id="image-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} accept="image/*" />
                    </label>
                    {imageFile && <p className="text-sm text-gray-400 mt-2 truncate text-center">Arquivo: {imageFile.name}</p>}
                </div>

                {/* Right side: Options */}
                <div className="w-full flex flex-col gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Prompt de animação (ex: 'uma brisa suave faz as folhas balançarem')"
                        className="w-full h-28 p-3 bg-black/20 border border-white/20 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
                    />
                    <div>
                        <p className="text-sm font-medium text-gray-300 mb-2">Proporção da Tela</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setAspectRatio('16:9')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Paisagem (16:9)</button>
                            <button type="button" onClick={() => setAspectRatio('9:16')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Retrato (9:16)</button>
                        </div>
                    </div>
                </div>
            </div>

            {error && <p className="text-red-400 text-center mt-4 text-sm">{error}</p>}

            <div className="text-center mt-6">
                <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2 mx-auto"
                    disabled={!imageFile || !prompt}
                >
                    <MovieIcon className="w-5 h-5" />
                    Gerar Vídeo
                </button>
            </div>
        </form>
    );
};

export default VideoForm;