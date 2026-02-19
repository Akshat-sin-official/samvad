import { FileText, ChevronRight } from 'lucide-react';
import type { BRDListItem } from './SearchBRDPopup';

interface BRDDetailViewProps {
  spec: BRDListItem | null;
  onNewProject: () => void;
}

export function BRDDetailView({ spec, onNewProject }: BRDDetailViewProps) {
  if (!spec) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-900">Spec not found</h2>
        <p className="text-slate-500 mt-1 text-sm">Select a spec from the sidebar or create a new one.</p>
        <button
          type="button"
          onClick={onNewProject}
          className="mt-4 text-indigo-600 font-medium text-sm hover:underline"
        >
          New spec
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{spec.name}</h1>
            {spec.updated && (
              <p className="text-sm text-slate-500 mt-1">Updated {spec.updated}</p>
            )}
            {spec.description && (
              <p className="text-slate-600 mt-2">{spec.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
        <p className="text-sm text-slate-600 mb-4">
          Full BRD content (requirements, data model, compliance) would load here when connected to a backend or local storage.
        </p>
        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Create a new spec
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
