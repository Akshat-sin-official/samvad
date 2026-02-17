import React from 'react';
import type { BRD } from '../types';
import { Badge } from './ui/badge';
import { Check, X, Target, Users, Globe, Lightbulb } from 'lucide-react';

interface BRDViewProps {
    data: BRD;
}

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <Icon className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
    </div>
);

export const BRDView: React.FC<BRDViewProps> = ({ data }) => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Executive Summary Card */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif tracking-tight">Executive Summary</h2>
                    <p className="text-slate-600 leading-relaxed text-lg">{data.problem_statement}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Objectives */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
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
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
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
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
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

            {/* Detailed Requirements */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <SectionHeader icon={Lightbulb} title="Functional Requirements" />
                <div className="space-y-4">
                    {data.functional_requirements.map((req, i) => (
                        <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-indigo-300">
                            <span className="font-mono text-xs text-indigo-400 font-bold pt-1">FR-{(i + 1).toString().padStart(2, '0')}</span>
                            <p className="text-slate-700 text-sm leading-relaxed">{req}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <SectionHeader icon={Lightbulb} title="Non-Functional Requirements" />
                <div className="space-y-4">
                    {data.non_functional_requirements.map((req, i) => (
                        <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-slate-300">
                            <span className="font-mono text-xs text-slate-400 font-bold pt-1">NFR-{(i + 1).toString().padStart(2, '0')}</span>
                            <p className="text-slate-700 text-sm leading-relaxed">{req}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
