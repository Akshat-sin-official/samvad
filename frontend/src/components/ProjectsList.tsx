import {
  FileText,
  MoreVertical,
  User,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import type { ProjectSummary } from '../api/client';
import { useMemo, useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface ProjectsListProps {
  projects: ProjectSummary[];
  onNewProject: () => void;
  onOpenProject: (id: string) => void;
}

export const ProjectsList = ({ projects, onNewProject, onOpenProject }: ProjectsListProps) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return projects;
    const q = query.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q),
    );
  }, [projects, query]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Specifications
          </h1>
          <p className="text-slate-500 mt-1 text-[14px]">
            Manage your architecture requirement documents
          </p>
        </div>
        <Button
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all text-sm h-9 px-4"
          onClick={onNewProject}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 opacity-70" /> New Specification
          </span>
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search specifications..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400"
          />
        </div>
        <Button variant="outline" className="gap-2 text-slate-600 rounded-md bg-white border border-slate-200 shadow-sm hover:bg-slate-50 h-9">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((project) => {
          let timeAgo = '—';
          if (project.updatedAt) {
            try {
              // Parse the ISO string returned from backend (e.g. "2024-05-18T14:30:00Z" or similar)
              timeAgo = formatDistanceToNow(parseISO(project.updatedAt), { addSuffix: true });
            } catch (err) {
              timeAgo = project.updatedAt; // fallback
            }
          }

          return (
            <button
              key={project.id}
              type="button"
              onClick={() => onOpenProject(project.id)}
              className="group text-left bg-white border border-slate-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer relative flex flex-col min-h-[260px]"
              style={{
                borderRadius: '2px 24px 2px 2px',
              }}
            >
              {/* Document Fold Effect */}
              <div className="absolute top-0 right-0 w-6 h-6 bg-slate-100 border-l border-b border-slate-200 rounded-bl transition-colors group-hover:bg-slate-200" style={{ borderBottomLeftRadius: '8px' }}></div>
              <div className="absolute top-0 right-0 w-6 h-6" style={{
                background: 'linear-gradient(to bottom left, white 50%, transparent 50%)',
                borderTopRightRadius: '24px'
              }}></div>

              <div className="flex justify-between items-start pt-6 pb-2 px-6">
                <div className="p-2 bg-slate-50 rounded text-slate-600 border border-slate-100 group-hover:bg-slate-100 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </div>
              </div>

              <div className="px-6 flex-1 flex flex-col">
                <h3 className="font-semibold text-[16px] leading-snug text-slate-800 mb-2 group-hover:text-slate-900 transition-colors break-words">
                  {project.name}
                </h3>

                <p className="text-[13px] text-slate-500 leading-relaxed font-normal mb-6 break-words line-clamp-4">
                  {project.description || "No problem statement provided."}
                </p>
              </div>

              <div className="px-6 pb-5 mt-auto border-t border-slate-100/60 pt-4 flex items-center justify-between text-[12px] text-slate-500 font-medium w-full">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <User className="w-3.5 h-3.5" /> You
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-500 transition-colors">
                  <Clock className="w-3.5 h-3.5" /> {timeAgo}
                </div>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && query.trim() !== '' && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 border border-slate-100">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-slate-800 font-medium text-[15px]">No specifications found</p>
            <p className="text-slate-500 mt-1 text-sm max-w-sm">We couldn't find any documents matching "{query}".</p>
          </div>
        )}

        {filtered.length === 0 && query.trim() === '' && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center relative">
            <div className="relative z-10 w-20 h-20 mb-6 mx-auto">
              <div className="relative bg-white shadow-sm border border-slate-200 rounded w-full h-full flex items-center justify-center text-slate-400"
                style={{ borderRadius: '2px 16px 2px 2px' }}>
                <div className="absolute top-0 right-0 w-5 h-5 bg-slate-50 border-l border-b border-slate-200 rounded-bl-sm"></div>
                <FileText className="w-8 h-8" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-slate-800 mb-2">Create a new specification</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 text-[14px] leading-relaxed">
              Start by describing your architectural needs to generate a comprehensive Business Requirements Document.
            </p>

            <Button
              onClick={onNewProject}
              className="bg-slate-900 hover:bg-slate-800 flex items-center shadow-sm transition-all h-10 px-6 rounded-md text-sm group text-white"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Generate Artifacts
              <ArrowRight className="w-3.5 h-3.5 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

