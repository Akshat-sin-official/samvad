import { useState, useEffect, useRef } from 'react';
import type { BRD, StakeholderItem } from '../types';
import mermaid from 'mermaid';
import {
    Users, Radio, Mail, MessageSquare, Lightbulb, Video,
    TrendingUp, ChevronRight, LayoutGrid, List, X, GitFork,
} from 'lucide-react';

interface StakeholderViewProps {
    data: BRD;
}

// ── helpers ──────────────────────────────────────────────────────────

const CHANNEL_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    email: { icon: Mail, color: 'text-blue-500', label: 'Email' },
    meeting: { icon: Video, color: 'text-violet-500', label: 'Meeting' },
    chat: { icon: MessageSquare, color: 'text-emerald-500', label: 'Chat' },
    idea: { icon: Lightbulb, color: 'text-amber-500', label: 'Idea' },
    call: { icon: Radio, color: 'text-rose-500', label: 'Call' },
};

const INFLUENCE_PALETTE = {
    HIGH: { bg: 'bg-indigo-600', ring: 'ring-indigo-400', badge: 'bg-indigo-100 text-indigo-700', glow: 'shadow-indigo-300/50', bar: 'bg-indigo-500' },
    MEDIUM: { bg: 'bg-blue-500', ring: 'ring-blue-400', badge: 'bg-blue-100 text-blue-700', glow: 'shadow-blue-300/50', bar: 'bg-blue-400' },
    LOW: { bg: 'bg-slate-400', ring: 'ring-slate-300', badge: 'bg-slate-100 text-slate-600', glow: 'shadow-slate-200/50', bar: 'bg-slate-300' },
};

const INTEREST_PALETTE = {
    HIGH: { badge: 'bg-emerald-100 text-emerald-700' },
    MEDIUM: { badge: 'bg-amber-100 text-amber-700' },
    LOW: { badge: 'bg-rose-100 text-rose-600' },
};

const LEVEL_META: Record<number, { label: string; icon: string; desc: string }> = {
    1: { label: 'Executive / Sponsor', icon: '👑', desc: 'Decision makers & budget owners' },
    2: { label: 'Manager / Lead', icon: '🎯', desc: 'Project leads & team managers' },
    3: { label: 'Contributor / Dev', icon: '⚙️', desc: 'Active builders & implementers' },
    4: { label: 'End User / Consumer', icon: '🙋', desc: 'Primary users of the final product' },
};

const QUADRANTS = [
    {
        key: 'manage', label: 'Manage Closely', emoji: '🎯',
        sub: 'High Influence · High Interest', bg: 'bg-indigo-50 border-indigo-200',
        filter: (s: StakeholderItem) => s.influence === 'HIGH' && s.interest === 'HIGH',
        tip: 'Engage regularly, co-create decisions, give top priority.',
    },
    {
        key: 'satisfy', label: 'Keep Satisfied', emoji: '🤝',
        sub: 'High Influence · Low Interest', bg: 'bg-blue-50 border-blue-200',
        filter: (s: StakeholderItem) => s.influence === 'HIGH' && s.interest !== 'HIGH',
        tip: 'Involve in major decisions, avoid overburdening with details.',
    },
    {
        key: 'inform', label: 'Keep Informed', emoji: '📢',
        sub: 'Low Influence · High Interest', bg: 'bg-amber-50 border-amber-200',
        filter: (s: StakeholderItem) => s.influence !== 'HIGH' && s.interest === 'HIGH',
        tip: 'Share updates proactively, gather feedback to increase buy-in.',
    },
    {
        key: 'monitor', label: 'Monitor', emoji: '👁️',
        sub: 'Low Influence · Low Interest', bg: 'bg-slate-50 border-slate-200',
        filter: (s: StakeholderItem) => s.influence !== 'HIGH' && s.interest !== 'HIGH',
        tip: 'Track passively, involve only on relevant milestones.',
    },
];

// ── Mermaid generation (subgraph hierarchy) ────────────────────────────

function buildMermaidDiagram(stakeholders: StakeholderItem[]): string {
    const sanitize = (s: string) =>
        s.replace(/["\[\]()#;]/g, '').replace(/\s+/g, ' ').trim().slice(0, 28);
    const sanitizeLabel = (s: string) =>
        s.replace(/["\[\]]/g, '').replace(/\n/g, ' ').trim().slice(0, 35);

    const byLevel: Record<number, StakeholderItem[]> = {};
    for (const s of stakeholders) {
        const lvl = Math.min(Math.max(s.hierarchy_level || 3, 1), 4);
        if (!byLevel[lvl]) byLevel[lvl] = [];
        byLevel[lvl].push(s);
    }

    let diagram = 'flowchart TB\n';

    // Class definitions — influence colours
    diagram += `  classDef high fill:#4f46e5,stroke:#3730a3,color:#fff,stroke-width:2,rx:10\n`;
    diagram += `  classDef medium fill:#3b82f6,stroke:#2563eb,color:#fff,stroke-width:2,rx:10\n`;
    diagram += `  classDef low fill:#64748b,stroke:#475569,color:#fff,stroke-width:2,rx:10\n\n`;

    const levelLabels: Record<number, string> = {
        1: 'Executive / Sponsor',
        2: 'Manager / Lead',
        3: 'Contributor / Dev',
        4: 'End User',
    };

    const levels = ([1, 2, 3, 4] as const).filter(l => byLevel[l]?.length);

    levels.forEach((level) => {
        const members = byLevel[level];
        const subId = `L${level}`;
        const emoji = LEVEL_META[level]?.icon ?? '•';
        diagram += `  subgraph ${subId}["${emoji} ${levelLabels[level]}"]\n`;
        diagram += `    direction LR\n`;
        for (const s of members) {
            const nodeId = `S_${sanitize(s.name)}_${level}`.replace(/\s/g, '_');
            const interestTag = s.interest === 'HIGH' ? '★★★' : s.interest === 'MEDIUM' ? '★★' : '★';
            const label = `${sanitizeLabel(s.name)}\\n${sanitizeLabel(s.role)}\\n${interestTag}`;
            diagram += `    ${nodeId}["${label}"]\n`;
            diagram += `    class ${nodeId} ${s.influence.toLowerCase()}\n`;
        }
        diagram += `  end\n\n`;
    });

    // Edges: connect levels top-down
    for (let i = 0; i < levels.length - 1; i++) {
        diagram += `  L${levels[i]} --> L${levels[i + 1]}\n`;
    }

    return diagram;
}

// ── Sub-components ───────────────────────────────────────────────────

function Avatar({ name, influence, size = 'md' }: { name: string; influence: 'HIGH' | 'MEDIUM' | 'LOW'; size?: 'sm' | 'md' | 'lg' }) {
    const palette = INFLUENCE_PALETTE[influence];
    const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' };
    return (
        <div className={`${sizeMap[size]} rounded-full ${palette.bg} text-white flex items-center justify-center font-bold ring-2 ${palette.ring} shadow-lg ${palette.glow}`}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

function InfluenceBar({ value }: { value: 'HIGH' | 'MEDIUM' | 'LOW' }) {
    const pct = value === 'HIGH' ? 90 : value === 'MEDIUM' ? 55 : 25;
    const palette = INFLUENCE_PALETTE[value];
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full ${palette.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 w-7 text-right">{pct}%</span>
        </div>
    );
}

function StakeholderCard({ stakeholder, onClick, selected }: { stakeholder: StakeholderItem; onClick: () => void; selected: boolean }) {
    const ip = INFLUENCE_PALETTE[stakeholder.influence];
    const chMeta = stakeholder.source_channel ? CHANNEL_META[stakeholder.source_channel] : null;
    const ChIcon = chMeta?.icon;

    return (
        <button
            onClick={onClick}
            className={`w-full text-left group relative bg-white rounded-2xl border-2 p-4 flex flex-col gap-3
        transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5
        ${selected ? `border-indigo-500 shadow-lg shadow-indigo-100 ring-2 ring-indigo-300/50` : 'border-slate-100 hover:border-indigo-200 shadow-sm'}`}
        >
            <div className="flex items-start gap-3">
                <Avatar name={stakeholder.name} influence={stakeholder.influence} />
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm leading-tight truncate">{stakeholder.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{stakeholder.role}</p>
                    {chMeta && ChIcon && (
                        <span className={`inline-flex items-center gap-1 text-[10px] mt-1 font-medium ${chMeta.color}`}>
                            <ChIcon className="w-3 h-3" />{chMeta.label}
                        </span>
                    )}
                </div>
                {selected && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1 animate-pulse" />}
            </div>
            <div className="flex flex-wrap gap-1.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ip.badge}`}>{stakeholder.influence} Influence</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${INTEREST_PALETTE[stakeholder.interest].badge}`}>{stakeholder.interest} Interest</span>
            </div>
            <InfluenceBar value={stakeholder.influence} />
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>{LEVEL_META[stakeholder.hierarchy_level]?.icon}</span>
                <span>Level {stakeholder.hierarchy_level} — {LEVEL_META[stakeholder.hierarchy_level]?.label}</span>
            </div>
        </button>
    );
}

function DetailDrawer({ stakeholder, onClose }: { stakeholder: StakeholderItem; onClose: () => void }) {
    const ip = INFLUENCE_PALETTE[stakeholder.influence];
    const chMeta = stakeholder.source_channel ? CHANNEL_META[stakeholder.source_channel] : null;
    const ChIcon = chMeta?.icon;
    const levelMeta = LEVEL_META[stakeholder.hierarchy_level];
    const quadrant = QUADRANTS.find(q => q.filter(stakeholder));

    return (
        <div className="sticky top-4 bg-white border-2 border-indigo-100 rounded-2xl shadow-2xl shadow-indigo-100/50 overflow-hidden">
            <div className={`${ip.bg} p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white, transparent 60%)' }} />
                <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                    <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-black ring-2 ring-white/40 shadow-xl">
                        {stakeholder.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold leading-tight">{stakeholder.name}</h3>
                        <p className="text-white/80 text-sm mt-0.5">{stakeholder.role}</p>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block font-medium">
                            {levelMeta?.icon} Level {stakeholder.hierarchy_level}
                        </span>
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Influence</p>
                        <InfluenceBar value={stakeholder.influence} />
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Interest</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full rounded-full ${stakeholder.interest === 'HIGH' ? 'bg-emerald-400' : stakeholder.interest === 'MEDIUM' ? 'bg-amber-400' : 'bg-rose-400'} transition-all duration-700`}
                                    style={{ width: stakeholder.interest === 'HIGH' ? '90%' : stakeholder.interest === 'MEDIUM' ? '55%' : '20%' }} />
                            </div>
                            <span className="text-[10px] text-slate-400 w-7 text-right">
                                {stakeholder.interest === 'HIGH' ? '90%' : stakeholder.interest === 'MEDIUM' ? '55%' : '20%'}
                            </span>
                        </div>
                    </div>
                </div>
                {chMeta && ChIcon && (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                        <ChIcon className={`w-5 h-5 ${chMeta.color}`} />
                        <div>
                            <p className="text-xs font-semibold text-slate-700">Source Channel</p>
                            <p className="text-[10px] text-slate-400">{chMeta.label}</p>
                        </div>
                    </div>
                )}
                {quadrant && (
                    <div className={`rounded-xl border-2 p-3 ${quadrant.bg}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{quadrant.emoji}</span>
                            <p className="text-xs font-bold text-slate-800">{quadrant.label}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{quadrant.tip}</p>
                    </div>
                )}
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Hierarchy</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-base">{levelMeta?.icon}</span>
                        <div>
                            <p className="text-xs font-semibold text-slate-700">{levelMeta?.label}</p>
                            <p className="text-[10px] text-slate-400">{levelMeta?.desc}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Mermaid Diagram view (presentation layout) ─────────────────────────

function MermaidDiagramView({ stakeholders }: { stakeholders: StakeholderItem[] }) {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState<string | null>(null);
    const renderCount = useRef(0);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            securityLevel: 'loose',
            fontFamily: 'Inter, system-ui, sans-serif',
            themeVariables: {
                primaryColor: '#4f46e5',
                primaryTextColor: '#ffffff',
                primaryBorderColor: '#3730a3',
                lineColor: '#cbd5e1',
                secondaryColor: '#3b82f6',
                tertiaryColor: '#f8fafc',
                background: '#ffffff',
                mainBkg: '#f8fafc',
                nodeBorder: '#e2e8f0',
                clusterBkg: '#f8fafc',
                clusterBorder: '#e2e8f0',
                titleColor: '#1e293b',
                edgeLabelBackground: '#ffffff',
                fontSize: '13px',
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: false,
                curve: 'basis',
                padding: 24,
                nodeSpacing: 50,
                rankSpacing: 60,
            },
        });

        const render = async () => {
            try {
                const definition = buildMermaidDiagram(stakeholders);
                const id = `stakeholder-diagram-${renderCount.current++}`;
                const { svg: rendered } = await mermaid.render(id, definition);
                setSvg(rendered);
                setError(null);
            } catch (e: unknown) {
                setError((e as Error).message || 'Could not render diagram');
            }
        };

        render();
    }, [stakeholders]);

    return (
        <div className="space-y-6">
            {/* Hero / Title block */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-900 text-white px-6 py-8 shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium mb-2">
                        <GitFork className="w-4 h-4" />
                        <span>Mermaid.js · Live diagram</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Stakeholder Hierarchy</h2>
                    <p className="mt-2 text-slate-300 text-sm max-w-xl leading-relaxed">
                        Decision flow from executives to end users. Each level is a group; nodes show influence (color) and interest (★). Follow the arrows to see reporting structure.
                    </p>
                </div>
            </div>

            {/* Legend strip */}
            <div className="flex flex-wrap items-center gap-6 px-5 py-4 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Legend</span>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="font-medium text-slate-600">Influence:</span>
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-lg bg-indigo-600 shadow-sm" title="High" />
                        <span className="text-slate-600">High</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-lg bg-blue-500 shadow-sm" title="Medium" />
                        <span className="text-slate-600">Medium</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-lg bg-slate-500 shadow-sm" title="Low" />
                        <span className="text-slate-600">Low</span>
                    </span>
                </div>
                <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="font-medium text-slate-600">Interest:</span>
                    <span className="text-amber-500 font-medium">★★★</span>
                    <span className="text-slate-500">High</span>
                    <span className="text-amber-500/80 font-medium">★★</span>
                    <span className="text-slate-500">Medium</span>
                    <span className="text-slate-400 font-medium">★</span>
                    <span className="text-slate-500">Low</span>
                </div>
            </div>

            {/* Diagram card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Hierarchy flow (top → bottom)</span>
                    <span className="text-xs text-slate-400">{stakeholders.length} stakeholder{stakeholders.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="p-6 sm:p-8 min-h-[520px] flex items-center justify-center overflow-auto bg-gradient-to-b from-slate-50/50 to-white">
                    {error ? (
                        <div className="flex items-center justify-center w-full min-h-[400px]">
                            <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-6 text-sm max-w-md text-center shadow-sm">
                                <p className="font-semibold mb-1">Diagram could not be rendered</p>
                                <p className="text-xs text-red-500 mt-2">{error}</p>
                            </div>
                        </div>
                    ) : svg ? (
                        <div
                            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:drop-shadow-sm"
                            dangerouslySetInnerHTML={{ __html: svg }}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-slate-400 min-h-[400px] justify-center">
                            <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-sm font-medium">Building hierarchy diagram...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* How to read callout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex gap-3 p-4 rounded-xl bg-indigo-50/80 border border-indigo-100">
                    <span className="text-xl shrink-0">👑</span>
                    <div>
                        <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">Level 1</p>
                        <p className="text-sm text-slate-600 mt-0.5">Executives & sponsors — decision makers</p>
                    </div>
                </div>
                <div className="flex gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-100">
                    <span className="text-xl shrink-0">🎯</span>
                    <div>
                        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Level 2–3</p>
                        <p className="text-sm text-slate-600 mt-0.5">Managers & contributors — delivery & execution</p>
                    </div>
                </div>
                <div className="flex gap-3 p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
                    <span className="text-xl shrink-0">🙋</span>
                    <div>
                        <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Level 4</p>
                        <p className="text-sm text-slate-600 mt-0.5">End users — primary beneficiaries</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main ─────────────────────────────────────────────────────────────

type FilterKey = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
type ViewMode = 'grid' | 'list' | 'matrix' | 'diagram';

export function StakeholderView({ data }: StakeholderViewProps) {
    const stakeholders = (data as unknown as { stakeholders?: StakeholderItem[] }).stakeholders;
    const hasMapped = stakeholders && stakeholders.length > 0;

    const [filter, setFilter] = useState<FilterKey>('ALL');
    const [viewMode, setViewMode] = useState<ViewMode>('diagram');
    const [selected, setSelected] = useState<StakeholderItem | null>(null);

    if (!hasMapped) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Stakeholder Map</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        No named stakeholders were extracted yet. Upload emails, meeting notes, or other context in <strong>Project Context</strong> and run <strong>Generate BRD</strong> to get a full hierarchy map. Below are the user roles inferred from your idea.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {(data.user_roles || []).map((role, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow min-w-[120px]">
                            <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">
                                {role.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{role}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const filtered = filter === 'ALL' ? stakeholders : stakeholders.filter(s => s.influence === filter);

    const counts = {
        ALL: stakeholders.length,
        HIGH: stakeholders.filter(s => s.influence === 'HIGH').length,
        MEDIUM: stakeholders.filter(s => s.influence === 'MEDIUM').length,
        LOW: stakeholders.filter(s => s.influence === 'LOW').length,
    };

    const byLevel: Record<number, StakeholderItem[]> = {};
    for (const s of filtered) {
        const lvl = Math.min(Math.max(s.hierarchy_level || 3, 1), 4);
        if (!byLevel[lvl]) byLevel[lvl] = [];
        byLevel[lvl].push(s);
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        Stakeholder Map
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {stakeholders.length} stakeholder{stakeholders.length !== 1 ? 's' : ''} extracted · influence &amp; interest classified
                    </p>
                </div>

                {/* View toggles */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    {([
                        { mode: 'grid' as ViewMode, Icon: LayoutGrid, label: 'Grid' },
                        { mode: 'list' as ViewMode, Icon: List, label: 'List' },
                        { mode: 'matrix' as ViewMode, Icon: TrendingUp, label: 'Matrix' },
                        { mode: 'diagram' as ViewMode, Icon: GitFork, label: 'Diagram' },
                    ]).map(({ mode, Icon, label }) => (
                        <button
                            key={mode}
                            onClick={() => { setViewMode(mode); setSelected(null); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                ${viewMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Icon className="w-3.5 h-3.5" />{label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter tabs (hidden in diagram mode) */}
            {viewMode !== 'diagram' && (
                <div className="flex items-center gap-2 flex-wrap">
                    {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as FilterKey[]).map(f => {
                        const color = f === 'HIGH' ? 'bg-indigo-600' : f === 'MEDIUM' ? 'bg-blue-500' : f === 'LOW' ? 'bg-slate-400' : '';
                        return (
                            <button
                                key={f}
                                onClick={() => { setFilter(f); setSelected(null); }}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150
                  ${filter === f ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {f !== 'ALL' && <span className={`w-2 h-2 rounded-full ${color}`} />}
                                {f === 'ALL' ? 'All' : `${f.charAt(0) + f.slice(1).toLowerCase()} Influence`}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {counts[f]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Diagram mode — full width, no detail drawer */}
            {viewMode === 'diagram' && (
                <MermaidDiagramView stakeholders={stakeholders} />
            )}

            {/* Other views with optional detail drawer */}
            {viewMode !== 'diagram' && (
                <div className={`flex gap-5 ${selected ? 'items-start' : ''}`}>
                    <div className={`min-w-0 transition-all duration-300 ${selected ? 'flex-1' : 'w-full'}`}>

                        {/* GRID */}
                        {viewMode === 'grid' && (
                            <div className="space-y-6">
                                {([1, 2, 3, 4] as const).map(level => {
                                    const members = byLevel[level];
                                    if (!members || members.length === 0) return null;
                                    const meta = LEVEL_META[level];
                                    return (
                                        <div key={level}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-lg">{meta.icon}</span>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{meta.label}</p>
                                                    <p className="text-xs text-slate-400">{meta.desc}</p>
                                                </div>
                                                <div className="flex-1 h-px bg-slate-100 ml-2" />
                                                <span className="text-xs text-slate-400">{members.length}</span>
                                            </div>
                                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                {members.map((s, i) => (
                                                    <StakeholderCard
                                                        key={i} stakeholder={s}
                                                        selected={selected?.name === s.name}
                                                        onClick={() => setSelected(selected?.name === s.name ? null : s)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* LIST */}
                        {viewMode === 'list' && (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-widest font-semibold text-slate-400">
                                    <div /><div>Name</div><div>Influence</div><div>Interest</div><div>Level</div><div>Channel</div>
                                </div>
                                {filtered.map((s, i) => {
                                    const ip = INFLUENCE_PALETTE[s.influence];
                                    const chMeta = s.source_channel ? CHANNEL_META[s.source_channel] : null;
                                    const ChIcon = chMeta?.icon;
                                    const isSel = selected?.name === s.name;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelected(isSel ? null : s)}
                                            className={`w-full grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center text-left border-b border-slate-50 last:border-0 transition-colors hover:bg-indigo-50/30 ${isSel ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                                        >
                                            <Avatar name={s.name} influence={s.influence} size="sm" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 truncate">{s.name}</p>
                                                <p className="text-xs text-slate-400 truncate">{s.role}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${ip.badge}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${ip.bar}`} />{s.influence}
                                            </span>
                                            <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${INTEREST_PALETTE[s.interest].badge}`}>{s.interest}</span>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <span>{LEVEL_META[s.hierarchy_level]?.icon}</span>
                                                <span className="truncate">{LEVEL_META[s.hierarchy_level]?.label}</span>
                                            </div>
                                            {ChIcon ? <ChIcon className={`w-4 h-4 ${chMeta?.color}`} /> : <span className="w-4" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* MATRIX */}
                        {viewMode === 'matrix' && (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
                                    <span className="font-semibold text-slate-700">Interest vs. Influence Matrix</span>
                                    <span>← Low Interest · High Interest →</span>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex flex-col justify-between items-center py-1 shrink-0 w-6">
                                        <span className="text-[10px] text-slate-400 font-semibold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>HIGH INFLUENCE</span>
                                        <span className="text-[10px] text-slate-400 font-semibold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>LOW INFLUENCE</span>
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                        {QUADRANTS.map(q => {
                                            const members = stakeholders.filter(q.filter);
                                            return (
                                                <div key={q.key} className={`rounded-2xl border-2 ${q.bg} p-4 min-h-[140px] relative`}>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-base">{q.emoji}</span>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{q.label}</p>
                                                            <p className="text-[10px] text-slate-500">{q.sub}</p>
                                                        </div>
                                                    </div>
                                                    {members.length === 0 ? (
                                                        <p className="text-xs text-slate-400 italic">No stakeholders</p>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {members.map((s, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => setSelected(selected?.name === s.name ? null : s)}
                                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 backdrop-blur-sm border hover:shadow-sm transition-all
                                    ${selected?.name === s.name ? 'border-indigo-400 ring-2 ring-indigo-200 text-indigo-700' : 'border-white/60 text-slate-700 hover:border-slate-300'}`}
                                                                >
                                                                    <Avatar name={s.name} influence={s.influence} size="sm" />
                                                                    {s.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-3 right-3">
                                                        <div className="group/matrix relative">
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help" />
                                                            <div className="pointer-events-none absolute bottom-full right-0 mb-2 hidden group-hover/matrix:block w-48 bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-2 shadow-xl z-10 leading-relaxed">{q.tip}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2 border-t border-slate-100">
                                    {QUADRANTS.map(q => (
                                        <div key={q.key} className="flex-1 text-center">
                                            <p className="text-lg font-black text-slate-900">{stakeholders.filter(q.filter).length}</p>
                                            <p className="text-[10px] text-slate-400 leading-tight">{q.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detail drawer */}
                    {selected && (
                        <div className="w-72 shrink-0 hidden lg:block">
                            <DetailDrawer stakeholder={selected} onClose={() => setSelected(null)} />
                        </div>
                    )}
                </div>
            )}

            {/* Mobile detail sheet */}
            {selected && viewMode !== 'diagram' && (
                <div className="lg:hidden">
                    <DetailDrawer stakeholder={selected} onClose={() => setSelected(null)} />
                </div>
            )}
        </div>
    );
}
