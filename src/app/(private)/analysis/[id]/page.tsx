'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Header from '@/components/header';

interface ResultData {
  isDeepfake: boolean;
  confidence: number;
  details: string;
}

interface Analysis {
  id: string;
  status: 'pending' | 'completed' | string;
  results?: { result: ResultData }[];
  media_url?: string;
  media_type?: 'image' | 'video' | string;
  created_at: string;
}

export default function AnalysisResultPage() {
  const router = useRouter();
  const params = useParams();
  const analysisId = params?.id as string;

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string>('');

  const isPending = analysis?.status === 'pending';
  const isCompleted = analysis?.status === 'completed';

  // Polling para atualizar status enquanto estiver pendente
  useEffect(() => {
    if (!analysisId) return;

    let interval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const { data } = await api.get(`/analysis/${analysisId}/status`);
        setAnalysis((prev) => ({ ...prev, ...data }));

        if (data.status === 'completed' && interval) {
          clearInterval(interval);
        }
      } catch (e) {
        console.error('Erro no polling:', e);
        setError('Erro ao atualizar status da análise.');
        toast.error('Erro ao atualizar status da análise.');
        if (interval) clearInterval(interval);
      }
    };

    fetchStatus();

    if (isPending) {
      interval = setInterval(fetchStatus, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [analysisId, isPending]);

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
      </div>
    );
  }

  const result = analysis.results?.[0];
  const resultData = result?.result;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold mb-2">Resultado da Análise</h1>
          <p className="text-gray-500 text-sm">ID: {analysis.id}</p>
        </div>

        {/* Pending */}
        {isPending && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-16 text-center space-y-6">
            <Loader2 className="w-14 h-14 animate-spin mx-auto text-gray-400" />
            <h3 className="text-2xl font-medium">Processando sua mídia...</h3>
            <p className="text-gray-500">
              Nosso sistema está analisando o arquivo. Isso pode levar alguns instantes.
            </p>
            <p className="text-sm text-gray-400">Atualizando automaticamente...</p>
          </div>
        )}

        {/* Completed with result */}
        {isCompleted && resultData && (
          <>
            <div
              className={`border-2 rounded-2xl p-8 shadow-sm ${
                resultData.isDeepfake ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start gap-6">
                {resultData.isDeepfake ? (
                  <XCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2">
                    {resultData.isDeepfake ? 'Deepfake Detectado' : 'Mídia Autêntica'}
                  </h3>
                  <p className="text-lg mb-4">
                    Nível de confiança: <strong>{resultData.confidence}%</strong>
                  </p>
                  <p className="text-gray-700">{resultData.details}</p>
                </div>
              </div>
            </div>

            {analysis.media_url && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="w-full max-h-96 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  {analysis.media_type === 'image' ? (
                    <img
                      src={analysis.media_url}
                      alt="Mídia analisada"
                      className="max-h-96 object-contain"
                    />
                  ) : (
                    <video controls className="max-h-96 w-full rounded-xl">
                      <source src={analysis.media_url} />
                    </video>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-3">
                  Analisado em {new Date(analysis.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Sobre os resultados</p>
                <p>
                  Esta análise usa algoritmos avançados de machine learning, mas nenhum sistema é 100%
                  preciso. Use este resultado como ferramenta auxiliar.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Completed sem resultado */}
        {isCompleted && !resultData && (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center space-y-4">
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-xl font-medium">Não foi possível processar</h3>
            <p className="text-gray-500">Ocorreu um erro durante a análise. Tente novamente.</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3">
          <Button
            onClick={() => router.push('/analysis/new')}
            className="bg-black text-white hover:bg-gray-900 px-6 py-2 rounded-lg shadow-md"
          >
            Nova Análise
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/history')}
            className="px-6 py-2 rounded-lg"
          >
            Ver Histórico
          </Button>
        </div>
      </div>
    </div>
  );
}