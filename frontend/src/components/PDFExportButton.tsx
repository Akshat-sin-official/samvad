import { useState, useRef } from 'react';
import type { GenerateResponse } from '../types';
import { Printer, Loader2 } from 'lucide-react';

interface PDFExportButtonProps {
    result: GenerateResponse;
    projectTitle: string;
    className?: string;
}

const SEV_COLOR: Record<string, string> = {
    CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#16a34a',
};

const CARD: React.CSSProperties = {
    background: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: '12px', padding: '24px', marginBottom: '24px',
};

const H2: React.CSSProperties = {
    fontSize: '18px', fontWeight: 700, color: '#1e293b',
    margin: '0 0 16px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0',
    display: 'block',
};

export function PDFExportButton({ result, projectTitle, className = '' }: PDFExportButtonProps) {
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleExport = async () => {
        if (!containerRef.current) return;
        setLoading(true);
        try {
            const [html2canvas, { jsPDF }] = await Promise.all([
                import('html2canvas').then(m => m.default),
                import('jspdf'),
            ]);
            const el = containerRef.current;
            el.style.display = 'block';
            el.style.position = 'fixed';
            el.style.left = '-9999px';
            el.style.top = '0';
            el.style.width = '794px';

            await new Promise(r => setTimeout(r, 600));

            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            el.style.display = 'none';
            el.style.position = '';
            el.style.left = '';
            el.style.top = '';

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const A4_W = pdf.internal.pageSize.getWidth();
            const A4_H = pdf.internal.pageSize.getHeight();
            const MARGIN = 40;
            const imgW = A4_W - MARGIN * 2;
            const ratio = imgW / canvas.width;
            const imgH = canvas.height * ratio;
            let y = 0;
            const pageH = A4_H - MARGIN * 2;

            while (y < imgH) {
                if (y > 0) pdf.addPage();
                const srcY = y / ratio;
                const srcH = Math.min(pageH / ratio, canvas.height - srcY);
                const slice = document.createElement('canvas');
                slice.width = canvas.width;
                slice.height = srcH;
                slice.getContext('2d')!.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
                pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', MARGIN, MARGIN, imgW, srcH * ratio);
                y += pageH;
            }

            pdf.save(`${projectTitle.replace(/\s+/g, '_')}_BRD.pdf`);
        } catch (err) {
            console.error('[PDF Export] Failed:', err);
            alert('PDF export failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const { brd, gaps, data_model, compliance, architecture, conflicts } = result;

    return (
        <>
            <button
                onClick={handleExport}
                disabled={loading}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-60 ${loading
                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-wait'
                        : 'bg-white border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-slate-600 shadow-sm'
                    } ${className}`}
            >
                {loading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating PDF...</>
                    : <><Printer className="w-3.5 h-3.5" /> Export PDF</>
                }
            </button>

            {/* ── Hidden A4 Document ───────────────────────────────────── */}
            <div ref={containerRef} style={{ display: 'none' }}>
                <div style={{
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                    color: '#1e293b',
                    background: '#f8fafc',
                    padding: '48px',
                    width: '794px',
                    boxSizing: 'border-box',
                    lineHeight: '1.6',
                }}>

                    {/* Cover */}
                    <div style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 60%, #818cf8 100%)',
                        borderRadius: '16px', padding: '40px', marginBottom: '32px', color: '#fff',
                    }}>
                        <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.75, marginBottom: '8px' }}>
                            Business Requirements Document
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>{projectTitle}</h1>
                        <p style={{ fontSize: '14px', opacity: 0.85, margin: 0 }}>{brd?.problem_statement?.slice(0, 200)}</p>
                        <div style={{ marginTop: '24px', display: 'flex', gap: '24px', fontSize: '11px', opacity: 0.7 }}>
                            <span>Samvad.ai</span>
                            <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            {result.metadata?.health_score != null && <span>Health Score: {result.metadata.health_score}/100</span>}
                            {result.metadata?.channel_count === 2 && <span>2-Channel Analysis</span>}
                        </div>
                    </div>

                    {/* Business Objectives */}
                    {brd?.business_objectives?.length > 0 && (
                        <div style={CARD}>
                            <h2 style={H2}>🎯 Business Objectives</h2>
                            <ol style={{ paddingLeft: '20px', margin: 0 }}>
                                {brd.business_objectives.map((obj, i) => (
                                    <li key={i} style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>{obj}</li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* RTM */}
                    {brd?.functional_requirements?.length > 0 && (
                        <div style={CARD}>
                            <h2 style={H2}>📋 Requirements Traceability Matrix</h2>
                            {brd.functional_requirements.map((req, i) => {
                                const r = typeof req === 'string'
                                    ? { req_id: `FR-${String(i + 1).padStart(2, '0')}`, text: req, source_quote: null }
                                    : req;
                                return (
                                    <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #6366f1', background: '#f8faff', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 700, color: '#6366f1', fontFamily: 'monospace', fontSize: '11px' }}>{r.req_id}</span>
                                        <span style={{ marginLeft: '10px', fontSize: '13px', color: '#334155' }}>{r.text}</span>
                                        {r.source_quote && (
                                            <div style={{ marginTop: '6px', fontSize: '11px', color: '#6366f1', background: '#eef2ff', borderRadius: '6px', padding: '6px 10px', fontStyle: 'italic' }}>
                                                📎 "{r.source_quote}"
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Scope */}
                    {(brd?.project_scope_in_scope?.length > 0 || brd?.project_scope_out_of_scope?.length > 0) && (
                        <div style={CARD}>
                            <h2 style={H2}>🔭 Project Scope</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '12px', marginBottom: '8px' }}>✓ In Scope</div>
                                    {brd.project_scope_in_scope.map((item, i) => (
                                        <div key={i} style={{ fontSize: '12px', color: '#475569', background: '#f0fdf4', borderRadius: '6px', padding: '6px 10px', marginBottom: '4px', border: '1px solid #dcfce7' }}>{item}</div>
                                    ))}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '12px', marginBottom: '8px' }}>✗ Out of Scope</div>
                                    {brd.project_scope_out_of_scope.map((item, i) => (
                                        <div key={i} style={{ fontSize: '12px', color: '#94a3b8', background: '#f8fafc', fontStyle: 'italic', borderRadius: '6px', padding: '6px 10px', marginBottom: '4px' }}>{item}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stakeholders */}
                    {brd?.stakeholders && brd.stakeholders.length > 0 && (
                        <div style={CARD}>
                            <h2 style={H2}>👥 Stakeholder Map</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        {['Name', 'Role', 'Influence', 'Interest', 'Channel'].map(h => (
                                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {brd.stakeholders.map((s, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>{s.name}</td>
                                            <td style={{ padding: '8px 12px', color: '#475569' }}>{s.role}</td>
                                            <td style={{ padding: '8px 12px' }}>
                                                <span style={{ background: s.influence === 'HIGH' ? '#eef2ff' : s.influence === 'MEDIUM' ? '#eff6ff' : '#f1f5f9', color: s.influence === 'HIGH' ? '#4f46e5' : '#64748b', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600 }}>{s.influence}</span>
                                            </td>
                                            <td style={{ padding: '8px 12px' }}>
                                                <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600 }}>{s.interest}</span>
                                            </td>
                                            <td style={{ padding: '8px 12px', color: '#94a3b8', fontSize: '11px' }}>{s.source_channel || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* NFRs */}
                    {brd?.non_functional_requirements?.length > 0 && (
                        <div style={CARD}>
                            <h2 style={H2}>⚙️ Non-Functional Requirements</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {brd.non_functional_requirements.map((r, i) => (
                                    <span key={i} style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>{r}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* KPIs */}
                    {brd?.key_performance_indicators?.length > 0 && (
                        <div style={CARD}>
                            <h2 style={H2}>📊 Key Performance Indicators</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {brd.key_performance_indicators.map((kpi, i) => (
                                    <div key={i} style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #faf5ff, #f5f3ff)', border: '1px solid #e9d5ff', borderRadius: '10px', fontSize: '12px', color: '#4c1d95', fontWeight: 500 }}>
                                        {kpi}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Risks — from brd.risks[] */}
                    {brd?.risks?.length > 0 && (
                        <div style={CARD}>
                            <h2 style={H2}>⚠️ Project Risks</h2>
                            {brd.risks.map((risk, i) => (
                                <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', borderLeft: '4px solid #d97706', background: '#fffbeb', marginBottom: '8px', fontSize: '13px', color: '#334155' }}>{risk}</div>
                            ))}
                        </div>
                    )}

                    {/* Gap Analysis — risk_flags + missing requirements */}
                    {(gaps?.risk_flags?.length > 0 || gaps?.missing_requirements?.length > 0) && (
                        <div style={CARD}>
                            <h2 style={H2}>🔍 Gap Analysis</h2>
                            {gaps.risk_flags?.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#dc2626', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risk Flags</div>
                                    {gaps.risk_flags.map((f, i) => (
                                        <div key={i} style={{ padding: '8px 14px', borderRadius: '8px', borderLeft: '4px solid #dc2626', background: '#fef2f2', marginBottom: '6px', fontSize: '13px', color: '#334155' }}>{f}</div>
                                    ))}
                                </div>
                            )}
                            {gaps.missing_requirements?.length > 0 && (
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Missing Requirements</div>
                                    {gaps.missing_requirements.map((r, i) => (
                                        <div key={i} style={{ fontSize: '12px', color: '#475569', padding: '5px 0', borderBottom: '1px dashed #f1f5f9' }}>• {r}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Data Model */}
                    {data_model?.entities?.length > 0 && (
                        <div style={CARD}>
                            <h2 style={H2}>🗄️ Data Model</h2>
                            {data_model.entities.map((entity, i) => (
                                <div key={i} style={{ marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ background: '#f8fafc', padding: '8px 14px', fontWeight: 700, fontSize: '13px', color: '#334155', borderBottom: '1px solid #e2e8f0' }}>
                                        {entity.entity_name}
                                    </div>
                                    {entity.fields?.slice(0, 10).map((f, j) => (
                                        <div key={j} style={{ padding: '6px 14px', fontSize: '11px', color: '#64748b', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontFamily: 'monospace', color: '#334155' }}>{f.field_name}</span>
                                            <span style={{ color: '#94a3b8' }}>{f.type} {f.sensitivity && f.sensitivity !== 'none' ? '🔒' : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Compliance */}
                    {compliance && (
                        (compliance.pii_fields?.length > 0 || compliance.recommended_encryption?.length > 0 || compliance.access_control_recommendations?.length > 0) && (
                            <div style={CARD}>
                                <h2 style={H2}>🛡️ Compliance & Data Governance</h2>
                                {compliance.pii_fields?.length > 0 && (
                                    <div style={{ marginBottom: '14px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '12px', color: '#dc2626', marginBottom: '6px' }}>PII Fields</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {compliance.pii_fields.map((f, i) => <span key={i} style={{ fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '6px' }}>{f}</span>)}
                                        </div>
                                    </div>
                                )}
                                {compliance.recommended_encryption?.length > 0 && (
                                    <div style={{ marginBottom: '14px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '12px', color: '#6366f1', marginBottom: '6px' }}>Recommended Encryption</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {compliance.recommended_encryption.map((e, i) => <span key={i} style={{ fontSize: '11px', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', padding: '2px 8px', borderRadius: '6px' }}>{e}</span>)}
                                        </div>
                                    </div>
                                )}
                                {compliance.access_control_recommendations?.length > 0 && (
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '12px', color: '#475569', marginBottom: '6px' }}>Access Control</div>
                                        {compliance.access_control_recommendations.map((r, i) => (
                                            <div key={i} style={{ fontSize: '12px', color: '#475569', padding: '4px 0', borderBottom: '1px dashed #f1f5f9' }}>• {r}</div>
                                        ))}
                                    </div>
                                )}
                                {compliance.retention_policy_suggestions?.length > 0 && (
                                    <div style={{ marginTop: '14px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '12px', color: '#475569', marginBottom: '6px' }}>Retention Policies</div>
                                        {compliance.retention_policy_suggestions.map((r, i) => (
                                            <div key={i} style={{ fontSize: '12px', color: '#475569', padding: '4px 0', borderBottom: '1px dashed #f1f5f9' }}>• {r}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    {/* Architecture */}
                    {architecture && (
                        <div style={CARD}>
                            <h2 style={H2}>🏗️ System Architecture</h2>
                            {architecture.microservices?.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Microservices / Components</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {architecture.microservices.map((svc, i) => (
                                            <div key={i} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontWeight: 600, fontSize: '12px', color: '#334155' }}>{svc.name}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{svc.description}</div>
                                                {svc.tech_stack?.length > 0 && (
                                                    <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                                                        {svc.tech_stack.map((t, j) => <span key={j} style={{ fontSize: '10px', background: '#eef2ff', color: '#4f46e5', padding: '1px 5px', borderRadius: '4px' }}>{t}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {architecture.cloud_infrastructure?.length > 0 && (
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cloud Infrastructure</div>
                                    {architecture.cloud_infrastructure.map((infra, i) => (
                                        <div key={i} style={{ fontSize: '12px', color: '#475569', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', marginBottom: '4px', display: 'flex', gap: '12px' }}>
                                            <span style={{ fontWeight: 600, color: '#334155', minWidth: '120px' }}>{infra.resource}</span>
                                            <span style={{ color: '#6366f1', minWidth: '100px' }}>{infra.type}</span>
                                            <span style={{ color: '#94a3b8' }}>{infra.justification}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Conflicts */}
                    {conflicts && conflicts.conflicts && conflicts.conflicts.length > 0 && (
                        <div style={CARD}>
                            <h2 style={H2}>⚡ Cross-Channel Conflicts</h2>
                            {conflicts.conflicts.map((c, i) => {
                                const color = SEV_COLOR[c.severity] || '#d97706';
                                return (
                                    <div key={i} style={{ padding: '14px', borderRadius: '10px', borderLeft: `4px solid ${color}`, background: '#fffbeb', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: color, padding: '2px 8px', borderRadius: '999px' }}>{c.severity}</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{c.conflict_type}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#334155', margin: '0 0 8px' }}>{c.description}</p>
                                        {c.recommendation && <p style={{ fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '8px', borderRadius: '6px', margin: 0 }}>💡 {c.recommendation}</p>}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            {c.source_1_quote && <div style={{ flex: 1, fontSize: '10px', color: '#6366f1', background: '#eef2ff', padding: '4px 8px', borderRadius: '4px', fontStyle: 'italic' }}>Channel 1: "{c.source_1_quote}"</div>}
                                            {c.source_2_quote && <div style={{ flex: 1, fontSize: '10px', color: '#0891b2', background: '#ecfeff', padding: '4px 8px', borderRadius: '4px', fontStyle: 'italic' }}>Channel 2: "{c.source_2_quote}"</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#94a3b8' }}>
                        <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', padding: '4px 16px', borderRadius: '999px', fontWeight: 600, fontSize: '12px', marginBottom: '8px' }}>
                            Samvad.ai
                        </div>
                        <div>Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Powered by Gemini AI</div>
                        {result.metadata && (
                            <div style={{ marginTop: '4px' }}>
                                Confidence: {Math.round((result.metadata.confidence_score ?? 0) * 100)}%
                                {result.metadata.health_score != null && ` · Health Score: ${result.metadata.health_score}/100`}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
