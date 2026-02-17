import { useState } from 'react';
import { generateBRD } from './api/client';
import type { GenerateResponse, BRD, GapAnalysis, DataModel, Compliance } from './types';
import { BRDView } from './components/BRDView';
import { GapView } from './components/GapView';
import { DataModelView } from './components/DataModelView';
import { ComplianceView } from './components/ComplianceView';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ScrollArea } from './components/ui/scroll-area';
import { Loader2, Sparkles, CheckCircle2, Copy, PlayCircle, BarChart3, ShieldCheck, Database, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mockData from './mock_data.json';

function App() {
  const [idea, setIdea] = useState('');
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateBRD(idea);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = () => {
    setLoading(true);
    setTimeout(() => {
      const demoResult: GenerateResponse = {
        brd: mockData[0] as unknown as BRD,
        gaps: mockData[1] as unknown as GapAnalysis,
        data_model: mockData[2] as unknown as DataModel,
        compliance: mockData[3] as unknown as Compliance
      };
      setResult(demoResult);
      setIdea(mockData[0].problem_statement || '');
      setLoading(false);
    }, 1200);
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">AutoBRD<span className="text-indigo-600">.ai</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900" onClick={handleLoadDemo}>
              <PlayCircle className="w-4 h-4 mr-2" />
              Load Demo
            </Button>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">v1.0.0</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 overflow-hidden h-[calc(100vh-64px)]">

        {/* Left Panel: Input */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-6 h-full overflow-y-auto pb-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Define Your Vision</h1>
              <p className="text-slate-500 text-lg leading-relaxed">
                Describe your business idea, and our multi-agent system will architect the solution for you.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all duration-300">
              <Textarea
                placeholder="e.g. A SaaS platform for freelance graphic designers enabling portfolio hosting, escrow payments, and client dispute resolution..."
                className="min-h-[240px] border-0 focus-visible:ring-0 resize-none text-base p-4 bg-transparent placeholder:text-slate-400"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-100 flex items-start gap-3">
                <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                {error}
              </div>
            )}

            <Button
              size="lg"
              className="w-full h-14 text-lg font-medium shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleSubmit}
              disabled={loading || !idea.trim()}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-200" />
                  <span>Analysis in Progress...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-200" />
                  <span>Generate Architecture</span>
                </div>
              )}
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              <span className="font-semibold text-sm text-slate-700">Detailed Specs</span>
              <span className="text-xs text-slate-500">Full BRD generation</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-sm text-slate-700">Data Schema</span>
              <span className="text-xs text-slate-500">Normalized SQL models</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-sm text-slate-700">Gap Analysis</span>
              <span className="text-xs text-slate-500">Risk & flaw detection</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-500" />
              <span className="font-semibold text-sm text-slate-700">Compliance</span>
              <span className="text-xs text-slate-500">GDPR & Security checks</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Output */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col">
          {!result ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center mb-6">
                {loading ? (
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                ) : (
                  <Sparkles className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {loading ? 'Orchestrating Agents...' : 'Ready to Architect'}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {loading
                  ? 'Our multi-agent system is now analyzing your requirements, identifying gaps, and structuring your database schema.'
                  : 'Your generated business requirements, data models, and compliance reports will appear here.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 text-green-700 p-1.5 rounded-md">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800">Generation Complete</h2>
                    <p className="text-xs text-slate-500">4 modules generated successfully</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-slate-600 border-slate-200 hover:bg-slate-50" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
              </div>

              <Tabs defaultValue="brd" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 pt-4 bg-slate-50/50 border-b border-slate-200">
                  <TabsList className="bg-slate-200/60 p-1 h-11 w-full justify-start rounded-lg mb-4 grid grid-cols-4 gap-1">
                    <TabsTrigger value="brd" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-xs font-medium uppercase tracking-wide">
                      Requirements
                    </TabsTrigger>
                    <TabsTrigger value="gap" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm text-xs font-medium uppercase tracking-wide">
                      Gap Analysis
                    </TabsTrigger>
                    <TabsTrigger value="data" className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm text-xs font-medium uppercase tracking-wide">
                      Data Model
                    </TabsTrigger>
                    <TabsTrigger value="compliance" className="data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm text-xs font-medium uppercase tracking-wide">
                      Compliance
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden bg-slate-50/30">
                  <ScrollArea className="h-full">
                    <AnimatePresence mode="wait">
                      <TabsContent value="brd" className="m-0 p-6 focus-visible:ring-0 outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                          <BRDView data={result.brd} />
                        </motion.div>
                      </TabsContent>
                      <TabsContent value="gap" className="m-0 p-6 focus-visible:ring-0 outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                          <GapView data={result.gaps} />
                        </motion.div>
                      </TabsContent>
                      <TabsContent value="data" className="m-0 p-6 focus-visible:ring-0 outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                          <DataModelView data={result.data_model} />
                        </motion.div>
                      </TabsContent>
                      <TabsContent value="compliance" className="m-0 p-6 focus-visible:ring-0 outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                          <ComplianceView data={result.compliance} />
                        </motion.div>
                      </TabsContent>
                    </AnimatePresence>
                  </ScrollArea>
                </div>
              </Tabs>
            </>
          )}
        </div>

      </main>
    </div>
  );
}

export default App;
