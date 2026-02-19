import {
  FolderGit2,
  MoreVertical,
  Calendar,
  User,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from './ui/button';
import type { ProjectSummary } from '../api/client';
import { useMemo, useState } from 'react';

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
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">
            Manage and organize your architecture specifications
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={onNewProject}>
          + New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <Button variant="outline" className="gap-2 text-slate-600">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onOpenProject(project.id)}
            className="group text-left bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2">
              {project.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> You
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {project.updatedAt || '—'}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-slate-500 col-span-full">
            No projects yet. Create your first project from the generator or click “New Project”.
          </div>
        )}
      </div>
    </div>
  );
};

