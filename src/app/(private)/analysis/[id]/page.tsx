'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Header from '@/components/header';

type AnalysisStatus = 'pending' | 'completed' | 'failed' | 'processing' | string;

type ResultRow = {
    id: number;
    analysis_id: string;
    type: string; // model | lum | swap | etc
    result: Record<string, any>; // JSON livre
    started_at?: string | null;
    finished_at?: string | null;
};

interface Analysis {
    id: string;
    status: AnalysisStatus;
    results?: ResultRow[];
    media_url?: string;
    media_type?: 'image' | 'video' | string;
    created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
    model: 'Modelo (Probabilidade)',
    lum: 'Iluminação',
    swap: 'Face Swap',
};

const DEFAULT_WEIGHTS: Record<string, number> = {
    "deepfake_detection": 0.75,
    "model": 0.75,
    "lum": 0.10,
    "swap": 0.05,
    "jpeg": 0.10,
};

function normalizeConfidence(raw: any): number | null {
    if (raw === null || raw === undefined) return null;
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isNaN(n)) return null;
    if (n <= 1) return n * 100;
    return n; 
}

function predictionToIsDeepfake(pred: any): boolean | null {
    if (!pred) return null;
    const s = String(pred).toUpperCase();
    if (s === 'FAKE' || s === 'DEEPFAKE' || s === 'MANIPULATED') return true;
    if (s === 'REAL' || s === 'AUTHENTIC') return false;
    return null;
}

function pickImageUrls(obj: any): string[] {
    const urls: string[] = [];
    const visit = (v: any) => {
        if (!v) return;
        if (typeof v === 'string') {
            const lower = v.toLowerCase();
            const looksLikeImage =
                lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp');
            const looksLikePath = lower.startsWith('/uploads/') || lower.startsWith('http://') || lower.startsWith('https://');
            if (looksLikeImage && looksLikePath) urls.push(v);
            return;
        }
        if (Array.isArray(v)) {
            v.forEach(visit);
            return;
        }
        if (typeof v === 'object') {
            Object.values(v).forEach(visit);
        }
    };
    visit(obj);
    // remove duplicados
    return Array.from(new Set(urls));
}

export default function AnalysisResultPage() {
    const router = useRouter();
    const params = useParams();
    const analysisId = params?.id as string;

    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [error, setError] = useState<string>('');

    const status = analysis?.status;
    const isPending = status === 'pending' || !status;
    const isProcessing = status == 'processing';
    const isCompleted = status === 'completed';
    const isFailed = status === 'failed';

    useEffect(() => {
        if (!analysisId) return;

        let interval: ReturnType<typeof setInterval> | undefined;

        const fetchStatus = async () => {
            try {
                const { data } = await api.get(`/analysis/${analysisId}`);

                // IMPORTANTE: Mesclamos o estado anterior com o novo.
                // Se 'data' não trouxer media_url, o 'prev' mantém o que já tinha.
                setAnalysis((prev) => {
                    const newState = { ...(prev || {}), ...data };
                    console.log("Novo estado da análise:", newState);
                    return newState;
                });

                if (data.status === 'completed' || data.status === 'failed') {
                    if (interval) clearInterval(interval);
                }
            } catch (e) {
                console.error('Erro no polling:', e);
                if (interval) clearInterval(interval);
            }
        };

        fetchStatus();
        interval = setInterval(fetchStatus, 3000);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [analysisId]);

    const results = analysis?.results ?? [];

    console.log(analysis)

    // Calcula score final ponderado (0-100)
    const verdict = useMemo(() => {
        if (!analysis) return null;

        const groups = results.reduce<Record<string, ResultRow[]>>((acc, r) => {
            const key = (r.type || 'other').toLowerCase();
            acc[key] = acc[key] || [];
            acc[key].push(r);
            return acc;
        }, {});

        const contributions: {
            type: string;
            weight: number;
            confidence: number | null;
            prediction: boolean | null;
            used: boolean;
        }[] = [];

        let weightedSum = 0;
        let weightSum = 0;

        for (const [type, rows] of Object.entries(groups)) {
            const weight = DEFAULT_WEIGHTS[type] ?? 0; // tipos desconhecidos não entram por padrão
            if (weight <= 0) continue;

            // regra: se vierem múltiplas linhas do mesmo type, usa a MAIOR confiança (você pode trocar por média)
            const confs = rows
                .map((r) => normalizeConfidence(r.result?.confidence))
                .filter((x): x is number => typeof x === 'number');

            const bestConf = confs.length ? Math.max(...confs) : null;

            // prediction: se houver, tenta ler; senão inferimos pelo threshold depois
            const preds = rows
                .map((r) => predictionToIsDeepfake(r.result?.prediction))
                .filter((x): x is boolean => typeof x === 'boolean');
            const pred = preds.length ? preds[0] : null;

            const used = bestConf !== null;
            contributions.push({ type, weight, confidence: bestConf, prediction: pred, used });

            if (bestConf !== null) {
                weightedSum += bestConf * weight;
                weightSum += weight;
            }
        }

        const score = weightSum > 0 ? weightedSum / weightSum : null; // 0-100

        // threshold (ajuste como quiser)
        const isDeepfake = score !== null ? score >= 50 : null;

        return { score, isDeepfake, contributions };
    }, [analysis, results]);

    if (!analysis) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-semibold mb-2" style={{ color: '#000' }}>
                        Resultado da Análise
                    </h1>
                    <p className="text-gray-500 text-sm">ID: {analysis.id}</p>
                </div>

                {/* Pending */}
                {(isPending || isProcessing) && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-16 text-center space-y-6">
                        <Loader2 className="w-14 h-14 animate-spin mx-auto text-gray-400" />
                        <h3 className="text-2xl font-medium" style={{ color: '#000' }}>
                            Processando sua mídia...
                        </h3>
                        <p className="text-gray-500">
                            Nosso sistema está analisando o arquivo. Isso pode levar alguns instantes.
                        </p>
                        <p className="text-sm text-gray-400">Atualizando automaticamente...</p>
                    </div>
                )}

                {/* Failed */}
                {isFailed && (
                    <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-10 text-center space-y-4">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <h3 className="text-2xl font-semibold" style={{ color: '#000' }}>
                            A análise falhou
                        </h3>
                        <p className="text-gray-600">
                            Não foi possível concluir o processamento desta mídia. Por favor tente novamente.
                        </p>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                )}

                {/* Completed */}
                {isCompleted && (
                    <>
                        {/* Veredito final */}
                        <div
                            className={`border-2 rounded-2xl p-8 shadow-sm ${verdict?.isDeepfake ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                {verdict?.isDeepfake ? (
                                    <XCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
                                ) : (
                                    <CheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
                                )}

                                <div className="flex-1">
                                    {/* Título baseado em faixas de risco */}
                                    <h3 className="text-2xl font-semibold mb-1" style={{ color: '#000' }}>
                                        {verdict?.score === null || verdict?.score === undefined
                                            ? 'Análise Inconclusiva'
                                            : verdict.score >= 80
                                                ? 'Alto Risco de Manipulação'
                                                : verdict.score >= 55
                                                    ? 'Possível Manipulação Detectada'
                                                    : verdict.score >= 35
                                                        ? 'Baixo Indício de Manipulação'
                                                        : 'Provavelmente Autêntica'}
                                    </h3>

                                    {/* Barra de probabilidade */}
                                    {verdict?.score !== null && verdict?.score !== undefined && (
                                        <div className="my-4">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Autêntica</span>
                                                <span>Manipulada</span>
                                            </div>
                                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${verdict.score}%`,
                                                        backgroundColor:
                                                            verdict.score >= 80
                                                                ? '#ef4444'
                                                                : verdict.score >= 55
                                                                    ? '#f97316'
                                                                    : verdict.score >= 35
                                                                        ? '#eab308'
                                                                        : '#22c55e',
                                                    }}
                                                />
                                            </div>
                                            <p className="text-right text-sm font-semibold mt-1" style={{ color: '#000' }}>
                                                {verdict.score.toFixed(1)}% de probabilidade de manipulação
                                            </p>
                                        </div>
                                    )}

                                    {/* Descrição contextual */}
                                    <p className="text-gray-600 text-sm">
                                        {verdict?.score === null || verdict?.score === undefined
                                            ? 'Não foi possível calcular um score com os dados disponíveis.'
                                            : verdict.score >= 80
                                                ? 'Os algoritmos identificaram fortes indícios de manipulação digital nesta mídia.'
                                                : verdict.score >= 55
                                                    ? 'Foram encontrados alguns padrões suspeitos. Recomendamos cautela ao partilhar este conteúdo.'
                                                    : verdict.score >= 35
                                                        ? 'Foram encontrados indícios leves. A mídia pode ser autêntica, mas apresenta algumas anomalias.'
                                                        : 'Nenhum padrão significativo de manipulação foi encontrado nesta mídia.'}
                                    </p>

                                    <p className="text-xs text-gray-400 mt-3">
                                        Score calculado por média ponderada:{' '}
                                        <strong>deepfake_detection (70%)</strong>,{' '}
                                        <strong>lum (15%)</strong>,{' '}
                                        <strong>swap (15%)</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>


                        {/* Mídia analisada */}
                        {analysis.media_url && (
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                                <div className="w-full max-h-96 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {analysis.media_type === 'image' ? (
                                        <img
                                            src={analysis.media_url?.startsWith('http')
                                                ? analysis.media_url
                                                : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${analysis.media_url}`
                                            }
                                            alt="Mídia analisada"
                                            className="max-h-96 object-contain"
                                        />
                                    ) : (
                                        <video controls className="max-h-96 w-full rounded-xl">
                                            <source src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${analysis.media_url}`} />
                                        </video>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm mt-3">
                                    Analisado em {new Date(analysis.created_at).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        )}

                        {/* Lista de resultados (múltiplas linhas) */}
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
                            <h3 className="text-xl font-semibold" style={{ color: '#000' }}>
                                Resultados Detalhados
                            </h3>

                            {results.length === 0 ? (
                                <p className="text-gray-500">Nenhum resultado foi gerado.</p>
                            ) : (
                                <div className="space-y-4">
                                    {results.map((r) => {
                                        const conf = normalizeConfidence(r.result?.confidence);
                                        const pred = predictionToIsDeepfake(r.result?.prediction);
                                        const images = pickImageUrls(r.result);

                                        return (
                                            <div key={r.id} className="border border-gray-200 rounded-xl p-4">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Tipo</p>
                                                        <p className="font-medium" style={{ color: '#000' }}>
                                                            {TYPE_LABEL[r.type?.toLowerCase()] ?? r.type}
                                                        </p>
                                                    </div>

                                                    <div className="text-left md:text-right">
                                                        <p className="text-sm text-gray-500">Confiança</p>
                                                        <p className="font-semibold" style={{ color: '#000' }}>
                                                            {conf === null ? '—' : `${conf.toFixed(1)}%`}
                                                        </p>
                                                    </div>
                                                </div>

                                                {(pred !== null || r.result?.prediction) && (
                                                    <p className="mt-3 text-sm text-gray-700">
                                                        <span className="font-medium">Predição:</span>{' '}
                                                        {pred === null ? String(r.result?.prediction) : pred ? 'FAKE' : 'REAL'}
                                                    </p>
                                                )}

                                                {/* JSON metadata (compacto) */}
                                                <details className="mt-3">
                                                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-black">
                                                        Ver detalhes técnicos
                                                    </summary>
                                                    <pre className="mt-3 text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto text-gray-600">
                                                        {JSON.stringify(r.result, null, 2)}
                                                    </pre>
                                                </details>

                                                {/* Imagens detectadas no JSON */}
                                                {images.length > 0 && (
                                                    <div className="mt-4">
                                                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                                                            <ImageIcon className="w-4 h-4" />
                                                            <span className="font-medium">Imagens</span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {images.map((url) => (
                                                                <div key={url} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`}
                                                                        alt="Artefato / metadata"
                                                                        className="w-full h-48 object-contain"
                                                                    />
                                                                    <div className="p-2 text-xs text-gray-500 break-all">{url}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Disclaimers */}
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex gap-4">
                            <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                            <div className="text-sm text-blue-900">
                                <p className="font-medium mb-1">Sobre os resultados</p>
                                <p>
                                    Esta análise combina múltiplas verificações. Nenhum sistema é 100% preciso. Use este resultado como ferramenta auxiliar.
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* Ações (sempre visíveis) */}
                <div className="flex gap-3">
                    <Button
                        onClick={() => router.push('/analysis')}
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