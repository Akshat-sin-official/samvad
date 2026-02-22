import type { ConflictAnalysis } from '../types';

const SEVERITY_CONFIG = {
    CRITICAL: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', label: '🔴 CRITICAL' },
    HIGH: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', label: '🟠 HIGH' },
    MEDIUM: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', label: '🟡 MEDIUM' },
    LOW: { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: '⬜ LOW' },
};

interface ConflictViewProps {
    conflicts: ConflictAnalysis;
    fileName1?: string | null;
    fileName2?: string | null;
}

export function ConflictView({ conflicts, fileName1, fileName2 }: ConflictViewProps) {
    const counts = {
        CRITICAL: conflicts.conflicts.filter(c => c.severity === 'CRITICAL').length,
        HIGH: conflicts.conflicts.filter(c => c.severity === 'HIGH').length,
        MEDIUM: conflicts.conflicts.filter(c => c.severity === 'MEDIUM').length,
        LOW: conflicts.conflicts.filter(c => c.severity === 'LOW').length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Summary Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold">Cross-Channel Conflict Report</h2>
                    <span className="text-xs text-slate-400">{conflicts.conflicts.length} conflicts detected</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{conflicts.summary}</p>

                {/* Severity counts */}
                <div className="flex gap-3 mt-4">
                    {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(sev => (
                        <div key={sev} className="flex items-center gap-1.5 text-xs">
                            <span className={`w-2 h-2 rounded-full ${SEVERITY_CONFIG[sev].dot}`} />
                            <span className="text-slate-300">{sev}</span>
                            <span className="font-bold text-white">{counts[sev]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Channel label strip */}
            {(fileName1 || fileName2) && (
                <div className="flex gap-3 text-xs">
                    <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-700">
                        <span className="font-semibold">Channel 1:</span> {fileName1 || 'Primary Source'}
                    </div>
                    <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-purple-700">
                        <span className="font-semibold">Channel 2:</span> {fileName2 || 'Secondary Source'}
                    </div>
                </div>
            )}

            {conflicts.conflicts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="font-medium text-slate-600">No conflicts detected</p>
                    <p className="text-sm mt-1">Both channels are aligned on requirements, deadlines, and scope.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {conflicts.conflicts.map((conflict, idx) => {
                        const cfg = SEVERITY_CONFIG[conflict.severity];
                        return (
                            <div key={idx} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-xs text-slate-500 capitalize">{conflict.conflict_type}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800">{conflict.description}</p>
                                    </div>
                                </div>

                                {/* Source quotes */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-blue-600 mb-1">Channel 1 says:</p>
                                        <p className="text-xs text-slate-700 italic">"{conflict.source_1_quote}"</p>
                                    </div>
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-purple-600 mb-1">Channel 2 says:</p>
                                        <p className="text-xs text-slate-700 italic">"{conflict.source_2_quote}"</p>
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div className="bg-white/70 rounded-lg px-3 py-2 text-xs text-slate-600">
                                    <span className="font-semibold text-slate-700">Recommendation: </span>
                                    {conflict.recommendation}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
