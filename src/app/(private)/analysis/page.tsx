'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import Header from '@/components/header';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NewAnalysisPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (selectedFile: File) => {
        if (!isValidFileType(selectedFile)) {
            setError('Formato não suportado. Use JPG, PNG, MP4 ou MOV.');
            return;
        }
        if (selectedFile.size > 50 * 1024 * 1024) {
            setError('Arquivo muito grande. Máximo 50MB.');
            return;
        }

        setFile(selectedFile);
        setError('');
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
    };

    const isValidFileType = (file: File): boolean => {
        const validTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'];
        return validTypes.includes(file.type);
    };

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
        if (e.dataTransfer.files?.[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleClickUploadArea = () => {
        fileInputRef.current?.click();
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/analysis/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Análise iniciada com sucesso!');
            router.push(`/analysis/${response.data.id}`);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.detail || 'Erro ao enviar arquivo.';
            setError(msg);
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview('');
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-5xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-semibold mb-4" style={{color: '#000'}}>Analisar nova mídia</h1>
                    <p className="text-gray-600 text-lg" style={{color: '#000'}}>
                        Faça upload de uma imagem ou vídeo e descubra se é autêntica ou deepfake
                    </p>
                </div>

                {/* Drag & Drop */}
                {!file && (
                    <div
                        className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-200 cursor-pointer
                            ${dragActive ? 'border-black bg-white shadow-lg' : 'border-gray-300 hover:border-gray-400 bg-white'}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={handleClickUploadArea}
                    >
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                            <Upload className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-medium mb-2" style={{color: '#000'}}>Arraste seu arquivo ou clique para selecionar</h3>
                        <p className="text-gray-500 mb-6">Suporta imagens (JPG, PNG) e vídeos (MP4, MOV) até 5MB</p>
                        <button className="bg-black text-white hover:bg-gray-900 px-8 py-3 rounded-lg shadow-md transition">
                            Selecionar Arquivo
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Arquivo selecionado */}
                {file && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-48 h-48 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                                {file.type.startsWith('image/') && (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                )}
                                {file.type.startsWith('video/') && (
                                    <video controls className="w-full h-full object-cover rounded-xl">
                                        <source src={preview} />
                                    </video>
                                )}
                            </div>

                            <div className="flex-1 space-y-3">
                                <h3 className="text-xl font-medium text-gray-600">{file.name}</h3>
                                <p className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                                {error && <p className="text-red-500 text-sm">{error}</p>}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={uploading}
                                        className="bg-black text-white hover:bg-gray-900 px-6 py-2 rounded-lg shadow-md transition disabled:opacity-50"
                                    >
                                        {uploading ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                                            </span>
                                        ) : 'Analisar Mídia'}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        disabled={uploading}
                                        className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 text-gray-600"
                                    >
                                        Escolher Outro
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}