import React, { useEffect, useState, useRef } from 'react';
import { Network, Database, Container, Server, Globe, Cpu } from 'lucide-react';
import type { Architecture } from '../types';
import mermaid from 'mermaid';

interface ArchitectureViewProps {
    data: Architecture;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ data }) => {
    const [mermaidSvg, setMermaidSvg] = useState<string>('');
    const [mermaidError, setMermaidError] = useState<string | null>(null);
    const renderCount = useRef(0);

    useEffect(() => {
        // Initialize mermaid once
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });

        const renderDiagram = async () => {
            try {
                if (!data.diagram_mermaid) {
                    setMermaidError("No diagram data available");
                    return;
                }

                // Use unique ID for each render
                const id = `mermaid-${renderCount.current++}`;

                // Render using mermaid.render API
                const { svg } = await mermaid.render(id, data.diagram_mermaid);
                setMermaidSvg(svg);
                setMermaidError(null);
            } catch (err: unknown) {
                setMermaidError((err as Error).message || "Could not render diagram");
            }
        };

        renderDiagram();
    }, [data.diagram_mermaid]);

    return (
        <div className="space-y-10 w-full">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Architecture</h2>
                    <p className="text-slate-500 mt-1">High-level microservices and infrastructure layout</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> Auto-Generated
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200">v1.0</span>
                </div>
            </div>

            {/* Diagram Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px] relative overflow-auto">
                <div className="absolute top-4 left-4 z-10">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Live Diagram</span>
                </div>
                {mermaidError ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="text-red-600 bg-red-50 p-4 rounded-lg text-sm border border-red-200">
                            <strong>Diagram Error:</strong> {mermaidError}
                        </div>
                    </div>
                ) : mermaidSvg ? (
                    <div
                        className="w-full flex items-center justify-center pt-8"
                        dangerouslySetInnerHTML={{ __html: mermaidSvg }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="text-slate-400 text-sm">Loading diagram...</div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Microservices Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                        <Container className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-semibold text-slate-800">Core Services</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {data.microservices.map((service, idx) => (
                            <div key={idx} className="p-5 hover:bg-slate-50/50 transition-colors">
                                <div className="flex justify-between items-start mb-2 gap-3">
                                    <h4 className="font-medium text-slate-900">{service.name}</h4>
                                    <div className="flex gap-1 flex-wrap justify-end">
                                        {service.tech_stack.map((tech, tIdx) => (
                                            <span key={tIdx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono whitespace-nowrap">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Infrastructure Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-semibold text-slate-800">Cloud Resources (AWS)</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {data.cloud_infrastructure.map((infra, idx) => (
                            <div key={idx} className="p-5 hover:bg-slate-50/50 transition-colors grid grid-cols-[1fr_auto] gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {infra.type === 'Database' && <Database className="w-4 h-4 text-slate-400" />}
                                        {infra.type === 'Compute' && <Server className="w-4 h-4 text-slate-400" />}
                                        {infra.type === 'Storage' && <FolderClosed className="w-4 h-4 text-slate-400" />}
                                        {!['Database', 'Compute', 'Storage'].includes(infra.type) && <Network className="w-4 h-4 text-slate-400" />}
                                        <span className="font-medium text-slate-900">{infra.resource}</span>
                                    </div>
                                    <p className="text-sm text-slate-500">{infra.justification}</p>
                                </div>
                                <span className={`self-start text-[10px] px-2 py-1 rounded-full font-medium border whitespace-nowrap
                                    ${infra.type === 'Database' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                                    ${infra.type === 'Compute' ? 'bg-orange-50 text-orange-700 border-orange-100' : ''}
                                    ${infra.type === 'Storage' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : ''}
                                 `}>{infra.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

function FolderClosed(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
        </svg>
    )
}
