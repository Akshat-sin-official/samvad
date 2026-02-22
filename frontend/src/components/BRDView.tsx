import React, { useState } from 'react';
import type { BRD, RequirementItem } from '../types';
import { Badge } from './ui/badge';
import { Check, X, Target, Users, Globe, Lightbulb, ChevronDown, ChevronRight, Quote, BarChart2, AlertTriangle, Database } from 'lucide-react';

interface BRDViewProps {
    data: BRD;
}

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <Icon className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
    </div>
);

const RequirementCard = ({ req, index }: { req: RequirementItem | string; index: number }) => {
    const [open, setOpen] = useState(false);

    // Handle legacy string format (backward compat)
    if (typeof req === 'string') {
        return (
            <div className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-indigo-300">
                <span className="font-mono text-xs text-indigo-400 font-bold pt-1">FR-{(index + 1).toString().padStart(2, '0')}</span>
                <p className="text-slate-700 text-sm leading-relaxed">{req}</p>
            </div>
        );
    }

    const hasSource = !!req.source_quote;

    return (
        <div className={`rounded-xl border transition-all ${hasSource ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100 bg-white'}`}>
            <div className="flex gap-3 p-3 items-start">
                <span className="font-mono text-xs text-indigo-500 font-bold pt-1 shrink-0">{req.req_id || `FR-${(index + 1).toString().padStart(2, '0')}`}</span>
                <p className="text-slate-700 text-sm leading-relaxed flex-1">{req.text}</p>
                {hasSource && (
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="shrink-0 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-md transition-colors"
                    >
                        <Quote className="w-3 h-3" />
                        Source
                        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                )}
            </div>
            {open && hasSource && (
                <div className="mx-3 mb-3 bg-white border border-indigo-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-indigo-500 font-semibold mb-1">📎 Extracted from source:</p>
                    <p className="text-xs text-slate-600 italic leading-relaxed">"{req.source_quote}"</p>
                </div>
            )}
        </div>
    );
};

export const BRDView: React.FC<BRDViewProps> = ({ data }) => {
    return (
        <div id="brd-overview" className="space-y-8 max-w-4xl mx-auto">
            {/* Executive Summary Card */}
            <div id="brd-problem-statement" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif tracking-tight">Executive Summary</h2>
                    <p className="text-slate-600 leading-relaxed text-lg">{data.problem_statement}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Objectives */}
                <div id="brd-objectives" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <SectionHeader icon={Target} title="Business Objectives" />
                    <ul className="space-y-3">
                        {data.business_objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-600">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                <span className="leading-snug">{obj}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Users */}
                <div id="brd-user-roles" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <SectionHeader icon={Users} title="Target Audience" />
                    <div className="flex flex-wrap gap-2">
                        {data.user_roles.map((role, i) => (
                            <Badge key={i} variant="secondary" className="px-3 py-1 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200">
                                {role}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scope Section */}
            <div id="brd-scope" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <SectionHeader icon={Globe} title="Project Scope" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-medium text-emerald-700 mb-3 flex items-center gap-2">
                            <Check className="w-4 h-4" /> In Scope
                        </h4>
                        <ul className="space-y-2">
                            {data.project_scope_in_scope.map((item, i) => (
                                <li key={i} className="text-sm text-slate-600 bg-emerald-50/50 p-2 rounded-md border border-emerald-100/50">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-rose-700 mb-3 flex items-center gap-2">
                            <X className="w-4 h-4" /> Out of Scope
                        </h4>
                        <ul className="space-y-2">
                            {data.project_scope_out_of_scope.map((item, i) => (
                                <li key={i} className="text-sm text-slate-400 italic bg-slate-50 p-2 rounded-md border border-slate-100">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Functional Requirements — RTM */}
            <div id="brd-requirements" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-semibold text-slate-800 text-lg">Functional Requirements</h3>
                    </div>
                    <span className="text-xs text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full font-mono">
                        RTM · {data.functional_requirements.length} reqs
                    </span>
                </div>
                <div className="space-y-2">
                    {data.functional_requirements.map((req, i) => (
                        <RequirementCard key={i} req={req} index={i} />
                    ))}
                </div>
            </div>

            {/* Non-Functional Requirements */}
            <div id="brd-non-functional" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <SectionHeader icon={Lightbulb} title="Non-Functional Requirements" />
                <div className="space-y-2">
                    {data.non_functional_requirements.map((req, i) => (
                        <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-slate-300">
                            <span className="font-mono text-xs text-slate-400 font-bold pt-1">NFR-{(i + 1).toString().padStart(2, '0')}</span>
                            <p className="text-slate-700 text-sm leading-relaxed">{req}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Requirements */}
            <div id="brd-data-requirements" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <SectionHeader icon={Database} title="Data Requirements" />
                <ul className="space-y-2">
                    {data.data_requirements.map((dr, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            {dr}
                        </li>
                    ))}
                </ul>
            </div>

            {/* KPIs */}
            <div id="brd-kpis" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <SectionHeader icon={BarChart2} title="Key Performance Indicators" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.key_performance_indicators.map((kpi, i) => (
                        <div key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg text-sm text-slate-700">
                            <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                            {kpi}
                        </div>
                    ))}
                </div>
            </div>

            {/* Assumptions & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div id="brd-assumptions" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <SectionHeader icon={Lightbulb} title="Assumptions" />
                    <ul className="space-y-2">
                        {data.assumptions.map((a, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                {a}
                            </li>
                        ))}
                    </ul>
                </div>
                <div id="brd-risks" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <SectionHeader icon={AlertTriangle} title="Risks" />
                    <ul className="space-y-2">
                        {data.risks.map((r, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
