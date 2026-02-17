import React from 'react';
import type { GapAnalysis } from '../types';
import { AlertCircle, HelpCircle, Flag, Ban, CheckCircle2 } from 'lucide-react';

interface GapViewProps {
    data: GapAnalysis;
}

const GapSection = ({ title, items, icon: Icon, color, bg, accentColor, description }: { title: string; items: string[]; icon: any; color: string; bg: string; accentColor: string; description: string }) => {
    if (!items || items.length === 0) {
        return (
            <div className={`p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center gap-2 text-slate-400`}>
                <CheckCircle2 className="w-5 h-5" />
                <span>No {title.toLowerCase()} identified.</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bg} ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                    <p className="text-slate-500 text-sm">{description}</p>
                </div>
            </div>

            <div className="grid gap-3">
                {items.map((item, idx) => (
                    <div key={idx} className={`
                        p-4 rounded-xl border transition-all duration-200 hover:shadow-sm
                        ${bg} border-slate-100 relative overflow-hidden group
                    `}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`}></div>
                        <div className="flex gap-3 pl-3">
                            <Icon className={`w-5 h-5 mt-0.5 ${color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                            <p className="text-slate-700 leading-relaxed text-sm font-medium">{item}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const GapView: React.FC<GapViewProps> = ({ data }) => {
    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>
                    Please review the following gaps and risks carefully. Addressing these early in the development lifecycle will prevent costly refactors later.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-10">
                    <GapSection
                        title="Missing Requirements"
                        items={data.missing_requirements}
                        icon={Ban}
                        color="text-rose-600"
                        bg="bg-rose-50/50"
                        accentColor="bg-rose-600"
                        description="Critical features absent from the initial scope."
                    />

                    <GapSection
                        title="Clarification Needed"
                        items={data.clarification_questions}
                        icon={HelpCircle}
                        color="text-amber-600"
                        bg="bg-amber-50/50"
                        accentColor="bg-amber-600"
                        description="Ambiguous points requiring stakeholder input."
                    />
                </div>

                <div>
                    <GapSection
                        title="Risk Assessment"
                        items={data.risk_flags}
                        icon={Flag}
                        color="text-orange-600"
                        bg="bg-orange-50/50"
                        accentColor="bg-orange-600"
                        description="Potential technical, business, or security risks."
                    />
                </div>
            </div>
        </div>
    );
};
