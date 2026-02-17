import React from 'react';
import type { Compliance } from '../types';
import { Lock, Server, ShieldCheck, FileText, Eye } from 'lucide-react';

interface ComplianceViewProps {
    data: Compliance;
}

const colorMap: Record<string, { bg: string, text: string, border: string }> = {
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
};

const ComplianceCard = ({ title, icon: Icon, items, colorClass, description }: { title: string; icon: any; items: string[]; colorClass: string; description: string }) => {
    const { bg, text, border } = colorMap[colorClass] || colorMap.indigo;

    return (
        <div className={`bg-white rounded-xl border ${border} shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 p-3 opacity-10 ${text} -mr-4 -mt-4 transition-transform group-hover:scale-110`}>
                <Icon className="w-24 h-24" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${bg} ${text}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{title}</h3>
                        <p className="text-xs text-slate-400">{description}</p>
                    </div>
                </div>

                {items.length === 0 ? (
                    <p className="text-sm text-slate-400 italic bg-slate-50 p-2 rounded text-center">No concerns flagged.</p>
                ) : (
                    <ul className="space-y-2">
                        {items.map((item, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2 text-slate-600 bg-slate-50/50 p-2 rounded hover:bg-slate-50 transition-colors">
                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${text.replace('text-', 'bg-')} shrink-0`} />
                                <span className="leading-snug">{item}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export const ComplianceView: React.FC<ComplianceViewProps> = ({ data }) => {
    const sensitiveCount = data.pii_fields.length + data.financial_fields.length;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">

            {/* Summary Banner */}
            <div className="bg-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Compliance Audit</h2>
                        <p className="text-slate-300 text-sm">Automated security & regulatory assessment</p>
                    </div>
                </div>

                <div className="flex gap-8 relative z-10">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{sensitiveCount}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Sensitive Fields</div>
                    </div>
                    <div className="w-[1px] bg-white/10 h-10"></div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">GDPR</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Framework</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ComplianceCard
                    title="PII Fields"
                    icon={Eye}
                    items={data.pii_fields}
                    colorClass="rose"
                    description="Personal data requiring GDPR/CCPA compliance."
                />

                <ComplianceCard
                    title="Financial Data"
                    icon={FileText}
                    items={data.financial_fields}
                    colorClass="emerald"
                    description="Payment data requiring PCI-DSS strictness."
                />

                <ComplianceCard
                    title="Encryption"
                    icon={Lock}
                    items={data.recommended_encryption}
                    colorClass="indigo"
                    description="Required cryptographic standards."
                />

                <ComplianceCard
                    title="Retention Policy"
                    icon={Server}
                    items={data.retention_policy_suggestions}
                    colorClass="blue"
                    description="Data lifecycle management rules."
                />

                <ComplianceCard
                    title="Access Control"
                    icon={ShieldCheck}
                    items={data.access_control_recommendations}
                    colorClass="purple"
                    description="IAM and authentication requirements."
                />

                {/* Empty State / Placeholder for future expansion */}
                <div className="border border-dashed border-slate-200 rounded-xl flex items-center justify-center p-6 text-slate-300">
                    <div className="text-center">
                        <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <span className="text-sm">More checks coming soon</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
