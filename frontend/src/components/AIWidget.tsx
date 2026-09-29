'use client';

import { useState } from 'react';
import { apiFetchAIAnalysis } from '@/lib/api';

export default function AIWidget() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetchAIAnalysis();
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось получить ответ от ИИ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Ассистент</h3>
            <p className="text-white/70 text-xs">DeepSeek анализирует вашу неделю</p>
          </div>
        </div>

        {!analysis && !loading && (
          <div className="py-4">
            <p className="text-sm text-white/80 mb-4">
              Нажмите кнопку ниже, чтобы получить персональные рекомендации по продуктивности на основе ваших задач и заметок за неделю.
            </p>
            <button
              onClick={handleAnalyze}
              className="w-full py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Сделать анализ
            </button>
          </div>
        )}

        {loading && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
            </div>
            <p className="text-sm font-medium animate-pulse">DeepSeek анализирует данные...</p>
          </div>
        )}

        {error && (
          <div className="py-4">
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-100">{error}</p>
            </div>
            <button
              onClick={handleAnalyze}
              className="w-full py-3 bg-white/20 text-white font-medium rounded-2xl hover:bg-white/30 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {analysis && !loading && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="prose prose-sm prose-invert max-w-none">
                {analysis.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 text-sm leading-relaxed text-white/95">
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <button
              onClick={() => setAnalysis(null)}
              className="mt-4 text-xs text-white/60 hover:text-white transition-colors"
            >
              Очистить анализ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
