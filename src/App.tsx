import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  AlertCircle, 
  RefreshCw,
  ChevronRight,
  Info,
  BarChart3,
  Zap
} from 'lucide-react';
import { PredictionChart } from './components/PredictionChart';
import { getMarketAnalysis } from './services/gemini';
import { MarketData, PredictionResult } from './types';
import { cn } from './lib/utils';
import Markdown from 'react-markdown';

// Mock historical data for ACWI
const HISTORICAL_DATA: MarketData[] = [
  { date: '2025-09', price: 105.2 },
  { date: '2025-10', price: 108.5 },
  { date: '2025-11', price: 107.1 },
  { date: '2025-12', price: 110.4 },
  { date: '2026-01', price: 112.8 },
  { date: '2026-02', price: 115.3 },
  { date: '2026-03', price: 114.9 },
];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<PredictionResult | null>(null);
  const [chartData, setChartData] = useState<MarketData[]>(HISTORICAL_DATA);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getMarketAnalysis();
      setAnalysis(result);
      
      // Generate prediction points based on trend
      const lastPrice = HISTORICAL_DATA[HISTORICAL_DATA.length - 1].price;
      const trendMultiplier = result.shortTermTrend === 'up' ? 1.02 : result.shortTermTrend === 'down' ? 0.98 : 1.001;
      
      const predictions: MarketData[] = [
        { date: '2026-04', price: lastPrice, prediction: lastPrice * trendMultiplier },
        { date: '2026-05', price: lastPrice, prediction: lastPrice * Math.pow(trendMultiplier, 2) },
        { date: '2026-06', price: lastPrice, prediction: lastPrice * Math.pow(trendMultiplier, 3) },
      ];
      
      setChartData([...HISTORICAL_DATA, ...predictions]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Global Equity Predictor</h1>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Chart & Summary */}
          <div className="lg:col-span-8 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  ACWI Market Trend
                </h2>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Historical
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    AI Prediction
                  </div>
                </div>
              </div>
              <PredictionChart data={chartData} />
            </section>

            <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium uppercase tracking-wider">
                <Info className="w-4 h-4" />
                AI Analysis Summary
              </div>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-2/3" />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <Markdown>{analysis?.summary}</Markdown>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Factors & Prediction */}
          <div className="lg:col-span-4 space-y-8">
            {/* Prediction Card */}
            <section className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-24 h-24" />
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Prediction</span>
                  {analysis && (
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase",
                      analysis.shortTermTrend === 'up' ? "bg-emerald-500/10 text-emerald-500" :
                      analysis.shortTermTrend === 'down' ? "bg-rose-500/10 text-rose-500" :
                      "bg-zinc-500/10 text-zinc-400"
                    )}>
                      {analysis.shortTermTrend}
                    </div>
                  )}
                </div>

                <div className="flex items-end gap-3">
                  {loading ? (
                    <div className="h-12 w-32 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <>
                      <span className="text-5xl font-bold tracking-tighter">
                        {analysis?.shortTermTrend === 'up' ? '+2.4%' : analysis?.shortTermTrend === 'down' ? '-1.8%' : '±0.2%'}
                      </span>
                      <span className="text-zinc-500 mb-2 font-medium">Next 3 Months</span>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-500 font-medium uppercase">
                    <span>AI Confidence</span>
                    <span>{loading ? '...' : `${analysis?.confidence}%`}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: loading ? 0 : `${analysis?.confidence}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Global Factors */}
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest px-1">Key Global Factors</h3>
              <div className="space-y-3">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
                  ))
                ) : (
                  analysis?.factors.map((f, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">{f.country}</span>
                          <h4 className="font-medium text-zinc-200 group-hover:text-white transition-colors">{f.factor}</h4>
                        </div>
                        {f.impact === 'positive' ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : f.impact === 'negative' ? (
                          <TrendingDown className="w-4 h-4 text-rose-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                        {f.description}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12 py-8 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <p>© 2026 Global Equity Predictor. Powered by Gemini AI.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-300 transition-colors">Methodology</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Data Sources</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Disclaimer</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
