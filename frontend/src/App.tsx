import { useState } from 'react';
import { BRDView } from './components/BRDView';
import { GapView } from './components/GapView';
import { DataModelView } from './components/DataModelView';
import { ComplianceView } from './components/ComplianceView';
import { ArchitectureView } from './components/ArchitectureView';
import { ProjectsList } from './components/ProjectsList';
import { Settings } from './components/Settings';
import { BRDDetailView } from './components/BRDDetailView';
import { Sidebar } from './components/Sidebar';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import {
  Loader2, Sparkles, CheckCircle2, PlayCircle,
  FolderGit2, Bell,
  Share2, ChevronRight, BrainCircuit, Server,
  FileText, Database, ShieldAlert,
} from 'lucide-react';
import type { BRD, GapAnalysis, DataModel, Compliance, Architecture, GenerateResponse } from './types';
import { generateBRD } from './api/client';
import mockData from './mock_data.json';
import { SearchBRDPopup } from './components/SearchBRDPopup';
import type { BRDListItem } from './components/SearchBRDPopup';

/** Single source of truth for BRD library (sidebar + search popup). */
const BRDS_LIBRARY: BRDListItem[] = [
  { id: 'brd-1', name: 'E-Commerce Microservices', updated: '2h ago', description: 'Scalable backend for multi-vendor marketplace' },
  { id: 'brd-2', name: 'Healthcare CRM', updated: '5h ago', description: 'Patient management system with HIPAA compliance' },
  { id: 'brd-3', name: 'FinTech Payment Gateway', updated: '1d ago', description: 'Secure transaction processing layer' },
  { id: 'brd-4', name: 'Logistics Tracker', updated: '2d ago', description: 'Real-time fleet tracking and optimization' },
  { id: 'brd-5', name: 'Social Media Analytics', updated: '1w ago', description: 'Big data processing pipeline for engagement metrics' },
];

// --- Login Modal Component ---
const LoginModal = ({ onLogin, onClose }: { onLogin: () => void, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Samvad<span className="text-indigo-600">.ai</span></h1>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">Sign in to save your work and access advanced features.</p>

        <div className="space-y-4">
          <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg h-12 shadow-md shadow-indigo-500/20" onClick={onLogin}>
            Log In
          </Button>
          <Button size="lg" variant="outline" className="w-full text-lg h-12 border-slate-200 hover:bg-slate-50 hover:text-slate-900">
            Sign Up
          </Button>
          <button
            onClick={onClose}
            className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors py-2"
          >
            Continue as Guest
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex justify-center gap-6 text-slate-400">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold">
              <ShieldAlert className="w-4 h-4" /> SOC2 Compliant
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold">
              <Server className="w-4 h-4" /> Enterprise Ready
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
        &copy; 2024 Samvad AI Inc. All rights reserved.
      </div>
    </div>
  </div>
);

// --- Transparency Footer ---
const TransparencyFooter = ({ metadata }: { metadata?: GenerateResponse['metadata'] }) => {
  if (!metadata) return null;
  const primaryModel = metadata.models_consulted?.[0] ?? '—';
  return (
    <div className="bg-white border-t border-slate-200 px-6 py-2 text-[10px] text-slate-500 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5"><BrainCircuit className="w-3 h-3 text-indigo-500" /> Model: {primaryModel}</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Confidence: {(metadata.confidence_score * 100).toFixed(0)}%</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Tokens: {metadata.tokens_used}</span>
        <span>Latency: {metadata.processing_time_ms}ms</span>
      </div>
    </div>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [activeTab, setActiveTab] = useState('new_project'); // Default to generator for now, can be 'dashboard'
  const [idea, setIdea] = useState('');
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPopupOpen, setSearchPopupOpen] = useState(false);

  // Demo loading
  const handleLoadDemo = () => {
    setLoading(true);
    setTimeout(() => {
      const demoResult: GenerateResponse = {
        brd: mockData[0] as unknown as BRD,
        gaps: mockData[1] as unknown as GapAnalysis,
        data_model: mockData[2] as unknown as DataModel,
        compliance: mockData[3] as unknown as Compliance,
        architecture: mockData[4] as unknown as Architecture,
        metadata: mockData[5] as unknown as GenerateResponse['metadata']
      };
      setResult(demoResult);
      setIdea(mockData[0].problem_statement || '');
      setLoading(false);
    }, 1200);
  };

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
  }

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setActiveTab('projects'); // Redirect to projects on login
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return <ProjectsList onNewProject={() => setActiveTab('new_project')} />;
      case 'settings':
        return <Settings />;
      case 'brd-1':
      case 'brd-2':
      case 'brd-3':
      case 'brd-4':
      case 'brd-5': {
        const spec = BRDS_LIBRARY.find((b) => b.id === activeTab) ?? null;
        return (
          <BRDDetailView
            spec={spec}
            onNewProject={() => setActiveTab('new_project')}
          />
        );
      }
      case 'new_project':
      default:
        return (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Header */}
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Projects</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className="font-medium text-slate-900">New Architecture Request</span>
                {result && (
                  <>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">v1.0</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="h-8 gap-2" onClick={handleLoadDemo}>
                  <PlayCircle className="w-3.5 h-3.5" /> Demo
                </Button>
                <div className="h-4 w-px bg-slate-200 mx-1"></div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="default" size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 gap-2">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden">

              {/* Context Panel (Input) */}
              <div className={`border-r border-slate-200 bg-white flex flex-col overflow-hidden transition-all duration-300 ${result ? 'w-[320px]' : 'w-[500px]'}`}>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                  <h2 className="font-semibold text-slate-800">Project Context</h2>
                  {result && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Processed</span>}
                </div>

                <div className="p-5 flex-1 overflow-y-auto">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Problem Statement</label>
                  <Textarea
                    placeholder="Describe the application you want to build..."
                    className="min-h-[200px] text-sm leading-relaxed resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                  />

                  <div className="mt-6">
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                      disabled={loading || !idea.trim()}
                      onClick={handleSubmit}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      {loading ? 'Consulting Agents...' : 'Generate Artifacts'}
                    </Button>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                      {error}
                    </div>
                  )}

                  {/* Project Meta (Mock) */}
                  <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Owner</span>
                      <span className="font-medium">John Doe</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Created</span>
                      <span className="font-medium">Just now</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Visibility</span>
                      <span className="font-medium">Team Private</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Artifacts Canvas */}
              {result ? (
                <div className="flex-1 bg-slate-50/50 flex flex-col overflow-hidden">
                  <Tabs
                    defaultValue={result.architecture ? 'architecture' : 'brd'}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {/* Fixed Tab Headers */}
                    <div className="px-6 pt-4 pb-0 border-b border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] shrink-0">
                      <TabsList className="bg-transparent h-auto p-0 gap-6 w-full justify-start rounded-none">
                        {result.architecture && (
                          <TabsTrigger
                            value="architecture"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none pb-3 pt-2 px-1 text-slate-500 font-medium hover:text-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Server className="w-4 h-4" /> Architecture
                            </div>
                          </TabsTrigger>
                        )}
                        <TabsTrigger
                          value="brd"
                          className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none pb-3 pt-2 px-1 text-slate-500 font-medium hover:text-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Requirements
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="data"
                          className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none pb-3 pt-2 px-1 text-slate-500 font-medium hover:text-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4" /> Data Model
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="gap"
                          className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none pb-3 pt-2 px-1 text-slate-500 font-medium hover:text-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" /> Risks & Gaps
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="compliance"
                          className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none pb-3 pt-2 px-1 text-slate-500 font-medium hover:text-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FolderGit2 className="w-4 h-4" /> Compliance
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-8 max-w-7xl mx-auto">
                        <TabsContent value="brd" className="m-0 focus-visible:ring-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <BRDView data={result.brd} />
                        </TabsContent>
                        {result.architecture && (
                          <TabsContent value="architecture" className="m-0 focus-visible:ring-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <ArchitectureView data={result.architecture} />
                          </TabsContent>
                        )}
                        <TabsContent value="data" className="m-0 focus-visible:ring-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <DataModelView data={result.data_model} />
                        </TabsContent>
                        <TabsContent value="gap" className="m-0 focus-visible:ring-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <GapView data={result.gaps} />
                        </TabsContent>
                        <TabsContent value="compliance" className="m-0 focus-visible:ring-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <ComplianceView data={result.compliance} />
                        </TabsContent>
                      </div>
                    </div>
                  </Tabs>
                </div>
              ) : (
                <div className="flex-1 bg-slate-50 flex items-center justify-center p-10">
                  <div className="text-center max-w-md">
                    {loading ? (
                      <div className="space-y-6">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto relative overflow-hidden">
                          <div className="absolute inset-0 bg-indigo-50/50 animate-pulse"></div>
                          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin relative z-10" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">Orchestrating Agents</h3>
                          <p className="text-slate-500 text-sm mt-1">Consulting expert models for architecture, security, and data...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 opacity-40 hover:opacity-100 transition-opacity">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl mx-auto flex items-center justify-center">
                          <BrainCircuit className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-300 pointer-events-none select-none">Waiting for Input</h3>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>

            {/* Transparency Layer - only show in generator */}
            <TransparencyFooter metadata={result?.metadata} />
          </div>
        );
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {showLoginModal && <LoginModal onLogin={handleLogin} onClose={handleCloseModal} />}

      <SearchBRDPopup
        open={searchPopupOpen}
        onClose={() => setSearchPopupOpen(false)}
        items={BRDS_LIBRARY}
        onSelectItem={(id) => {
          setActiveTab(id);
          setSearchPopupOpen(false);
        }}
      />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLoginModal(true)}
        onOpenSearch={() => setSearchPopupOpen(true)}
        brds={BRDS_LIBRARY}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Guest Mode Warning Banner */}
        {!isLoggedIn && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-sm shrink-0">
            <div className="flex items-center gap-2 text-amber-800">
              <ShieldAlert className="w-4 h-4" />
              <span><strong>Guest Mode:</strong> Your work won't be saved. <button onClick={() => setShowLoginModal(true)} className="underline font-semibold hover:text-amber-900">Log in</button> to save and access history.</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden relative leading-normal">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
