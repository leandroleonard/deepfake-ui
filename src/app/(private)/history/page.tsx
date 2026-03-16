'use client';

import { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle, Calendar, Clock, Loader2, ChevronRight } from 'lucide-react';
import Header from '@/components/header';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Result {
  isDeepfake: boolean;
  confidence: number;
}

interface Analysis {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  result?: Result;
  media_url?: string;
  media_type?: 'image' | 'video';
  created_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalDeepfakes = analyses.filter((a) => a.result?.isDeepfake === true).length;

  const StatusIcon = ({ analysis }: { analysis: Analysis }) => {
    if (analysis.status === 'pending') {
      return (
        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-yellow-100">
          <Loader2 className="w-7 h-7 text-yellow-600 animate-spin" />
        </div>
      );
    }
    if (analysis.result?.isDeepfake) {
      return (
        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-100">
          <XCircle className="w-7 h-7 text-red-600" />
        </div>
      );
    }
    return (
      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-100">
        <CheckCircle className="w-7 h-7 text-green-600" />
      </div>
    );
  };

  const StatusBadge = ({ analysis }: { analysis: Analysis }) => {
    if (analysis.status === 'pending') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
          Processando...
        </span>
      );
    }
    if (analysis.status === 'failed') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
          Falhou
        </span>
      );
    }
    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          analysis.result?.isDeepfake
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        }`}
      >
        {analysis.result?.isDeepfake ? 'Deepfake' : 'Autêntica'}
      </span>
    );
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/analysis/');
        setAnalyses(res.data);
      } catch (err) {
        toast.error('Erro ao carregar histórico.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold mb-2" style={{color: '#000'}}>Suas Análises</h1>
            <p className="text-gray-600 text-lg">Visualize e gerencie suas análises de deepfake</p>
          </div>
          <Button
            onClick={() => router.push('/analysis')}
            className="bg-black text-white hover:bg-gray-900 px-6 py-3 rounded-lg shadow-md"
          >
            Nova Análise
          </Button>
        </div>

        {analyses.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center bg-white shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-medium mb-2" style={{color: '#000'}}>Nenhuma análise ainda</h3>
            <p className="text-gray-500 mb-6">
              Comece analisando sua primeira mídia e receba insights detalhados
            </p>
            <Button
              onClick={() => router.push('/analysis')}
              className="bg-black text-white hover:bg-gray-900 px-6 py-3 rounded-lg shadow-md"
            >
              Fazer Primeira Análise
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
                    <StatusIcon analysis={analysis} />

                    {analysis.media_url && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {analysis.media_type === 'image' ? (
                          <img
                            src={analysis.media_url}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video className="w-full h-full object-cover">
                            <source src={analysis.media_url} />
                          </video>
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-gray-400 truncate">
                          #{analysis.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="hidden md:block text-gray-300">·</span>
                        <span className="text-sm text-gray-500 capitalize">
                          {analysis.media_type === 'image' ? '🖼 Imagem' : '🎥 Vídeo'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(analysis.created_at)}</span>
                      </div>

                      {analysis.result?.confidence && (
                        <p className="text-sm text-gray-500 mt-1">
                          Confiança: <strong>{analysis.result.confidence}%</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <StatusBadge analysis={analysis} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/analysis/${analysis.id}`)}
                        className="flex items-center gap-1 text-sm px-4 py-1.5 rounded-lg"
                      >
                        Ver detalhes
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h3 className="font-medium mb-1">Total de análises</h3>
                <p className="text-2xl font-semibold">{analyses.length}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Processando</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  {analyses.filter((a) => a.status === 'pending').length}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Deepfakes detectados</h3>
                <p className="text-2xl font-semibold text-red-600">{totalDeepfakes}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Autênticas</h3>
                <p className="text-2xl font-semibold text-green-600">
                  {
                    analyses.filter(
                      (a) => a.result && !a.result.isDeepfake
                    ).length
                  }
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}