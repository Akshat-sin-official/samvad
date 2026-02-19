import {
    Activity, Server, Database, CheckCircle2, AlertTriangle, XCircle
} from 'lucide-react';
import { Button } from './ui/button';

export const System = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Status</h1>
                    <p className="text-slate-500 mt-1">Real-time infrastructure monitoring</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Activity className="w-4 h-4" /> Refresh
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                            <Server className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">System Uptime</p>
                            <h3 className="text-2xl font-bold text-slate-900">99.99%</h3>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[99.9%]" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">API Latency</p>
                            <h3 className="text-2xl font-bold text-slate-900">24ms</h3>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[30%]" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Database Load</p>
                            <h3 className="text-2xl font-bold text-slate-900">42%</h3>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[42%]" />
                    </div>
                </div>
            </div>

            {/* Services List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-900">Service Health</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { name: "Core API Service", status: "Operational", uptime: "14d 2h", version: "v2.4.0" },
                        { name: "Auth Service", status: "Operational", uptime: "45d 12h", version: "v1.2.1" },
                        { name: "AI Inference Engine", status: "Degraded", uptime: "2d 5h", version: "v3.0.0-beta" },
                        { name: "Vector Database", status: "Operational", uptime: "14d 2h", version: "v0.9.8" },
                        { name: "Notification Worker", status: "Operational", uptime: "5h 30m", version: "v1.0.5" },
                    ].map((service, i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${service.status === 'Operational' ? 'bg-emerald-500' :
                                        service.status === 'Degraded' ? 'bg-amber-500' : 'bg-red-500'
                                    }`} />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{service.name}</p>
                                    <p className="text-xs text-slate-500">Version: {service.version}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-sm text-slate-600 font-mono">{service.uptime}</div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${service.status === 'Operational'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : service.status === 'Degraded'
                                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                                            : 'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                    {service.status === 'Operational' ? <CheckCircle2 className="w-3 h-3" /> :
                                        service.status === 'Degraded' ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    {service.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
