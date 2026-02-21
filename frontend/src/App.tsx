import { useEffect, useState } from 'react';
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
import type { GenerateResponse, ProjectVersion, ProjectDetail } from './types';
import { generateBRD, fetchProjects, type ProjectSummary, fetchProjectById, setAuthTokenGetter, fetchCurrentUser } from './api/client';
import { SearchBRDPopup } from './components/SearchBRDPopup';
import type { BRDListItem } from './components/SearchBRDPopup';
import { useAuth } from './auth';
import { AuthModal } from './components/auth/AuthModal';



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
  const { user, loading: authLoading, signOutUser } = useAuth();
  const isLoggedIn = !!(user && (user.providerData[0]?.providerId !== 'password' || user.emailVerified));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('new_project');
  const [idea, setIdea] = useState('');
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPopupOpen, setSearchPopupOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>("New Architecture Request");
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<number>(1);

  // Show login modal if not authenticated and auth has finished loading
  useEffect(() => {
    if (authLoading) return;
    if (isLoggedIn) {
      setShowLoginModal(false);
    } else {
      setShowLoginModal(true);
    }
  }, [authLoading, isLoggedIn]);

  useEffect(() => {
    setAuthTokenGetter(async () => {
      if (!user) return null;
      try {
        // forceRefresh=true ensures we never send an expired token,
        // which also powers the 401-retry in the API interceptor.
        return await user.getIdToken(true);
      } catch (e) {
        console.error('[Auth] getIdToken failed:', e);
        return null;
      }
    });
  }, [user]);

  // Initialize user record in database after successful authentication
  useEffect(() => {
    if (authLoading || !isLoggedIn || !user) {
      return;
    }

    const initializeUser = async () => {
      try {
        await fetchCurrentUser();
      } catch (e: unknown) {
        const err = e as { response?: { status?: number }; message?: string };
        if (err.response?.status === 401) {
          setError('Failed to authenticate with backend. Please try signing in again.');
        } else if (err.response?.status === 404) {
          // Backend may not have /users/me deployed yet - ignore
        } else if (err.response?.status && err.response.status >= 500) {
          setError('Backend server error. Please try again later.');
        } else if (!err.message?.includes('Network Error')) {
          setError(`Failed to initialize user: ${err.message || 'Unknown error'}`);
        }
      }
    };

    initializeUser();
  }, [isLoggedIn, authLoading, user]);

  useEffect(() => {
    // Don't load projects if auth is still loading or user is not logged in
    if (authLoading || !isLoggedIn || !user) {
      if (!isLoggedIn) {
        setProjects([]);
      }
      return;
    }

    const load = async () => {
      try {
        const list = await fetchProjects();
        setProjects(list);
      } catch (e: unknown) {
        const err = e as { response?: { status?: number }; message?: string };
        if (err.response?.status === 401) {
          setError('Authentication failed. Please try signing in again.');
        } else if (err.response?.status === 404) {
          // Backend may not have /projects endpoint deployed yet - just use empty list
          setProjects([]);
        } else if (err.response?.status && err.response.status >= 500) {
          setError('Backend server error. Please try again later.');
        }
      }
    };
    load();
  }, [isLoggedIn, authLoading, user]);

  const handleSubmit = async () => {
    if (!idea.trim()) return;
    if (!isLoggedIn) {
      setError('Please log in with Google to generate and save projects.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        idea,
        ...(selectedProjectId ? { project_id: selectedProjectId } : {})
      };

      const { project_id, artifacts, project_title } = await generateBRD(payload);

      // Update local state temporarily
      setResult(artifacts);
      setSelectedProjectId(project_id);
      if (project_title) setProjectTitle(project_title);

      // Force fetch full project to get the newly appended version array
      const full = await fetchProjectById(project_id) as ProjectDetail;
      setVersions(full.versions || []);
      setCurrentVersion(full.currentVersion || 1);

      const list = await fetchProjects();
      setProjects(list);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      let errorMessage = 'An unexpected error occurred.';

      if (e.response?.status === 500) {
        errorMessage = e.response?.data?.detail || 'Backend server error. Please check server logs.';
      } else if (e.response?.status === 401) {
        errorMessage = 'Authentication failed. Please try signing in again.';
      } else if (e.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check backend configuration.';
      } else if (e.response?.data?.detail) {
        errorMessage = e.response.data.detail;
      } else if (e.message) {
        errorMessage = e.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleNewProject = () => {
    setActiveTab('new_project');
    setResult(null);
    setIdea('');
    setSelectedProjectId(null);
    setProjectTitle("New Architecture Request");
    setVersions([]);
    setCurrentVersion(1);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  const handleSelectProject = async (id: string) => {
    setActiveTab('new_project');
    setSelectedProjectId(id);
    try {
      const full = await fetchProjectById(id) as ProjectDetail;
      setIdea(full.idea || '');
      setResult(full.artifacts);
      setProjectTitle(full.title || full.artifacts.brd?.project_title || "Untitled project");
      setVersions(full.versions || []);
      setCurrentVersion(full.currentVersion || 1);
    } catch {
      setError('Failed to load project.');
    }
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetVer = parseInt(e.target.value, 10);
    const versionObj = versions.find(v => v.version === targetVer);
    if (versionObj) {
      setCurrentVersion(versionObj.version);
      setIdea(versionObj.idea);
      setResult(versionObj.artifacts);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return (
          <ProjectsList
            projects={projects}
            onNewProject={handleNewProject}
            onOpenProject={handleSelectProject}
          />
        );
      case 'settings':
        return <Settings />;
      case 'brd-1':
      case 'brd-2':
      case 'brd-3':
      case 'brd-4':
      case 'brd-5': {
        const spec = null;
        return (
          <BRDDetailView
            spec={spec}
            onNewProject={handleNewProject}
          />
        );
      }
      case 'new_project':
      default:
        return (
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">

            {/* Ambient Background for entire app */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 bg-slate-50/50">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px]" />
              <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-violet-400/10 blur-[100px]" />
            </div>

            {/* Top Header */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Projects</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className="font-medium text-slate-900 truncate max-w-[300px]" title={projectTitle}>{projectTitle}</span>
                {result && versions.length > 0 && (
                  <>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <select
                      value={currentVersion}
                      onChange={handleVersionChange}
                      className="bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 transition-colors px-2.5 py-1 rounded-md text-[13px] font-mono border border-indigo-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none shadow-sm"
                    >
                      {versions.map(v => (
                        <option key={v.version} value={v.version}>v{v.version}.0</option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2"
                  onClick={async () => {
                    const demoIdea = 'Freelance designer marketplace with escrow payments and dispute resolution.';
                    setIdea(demoIdea);
                    await handleSubmit();
                  }}
                  disabled={loading}
                >
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
                      <strong>Error:</strong> {error}
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
      {!authLoading && showLoginModal && (
        <AuthModal
          onClose={handleCloseModal}
          error={error}
        />
      )}

      <SearchBRDPopup
        open={searchPopupOpen}
        onClose={() => setSearchPopupOpen(false)}
        items={projects.map<BRDListItem>((p) => ({
          id: p.id,
          name: p.name,
          updated: p.updatedAt,
          description: p.description,
        }))}
        onSelectItem={(id) => {
          handleSelectProject(id);
          setSearchPopupOpen(false);
        }}
      />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewProject={handleNewProject}
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={() => setShowLoginModal(true)}
        onOpenSearch={() => setSearchPopupOpen(true)}
        onLogout={signOutUser}
        brds={projects.map((p) => ({
          id: p.id,
          name: p.name,
          updated: p.updatedAt,
          description: p.description,
        }))}
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
