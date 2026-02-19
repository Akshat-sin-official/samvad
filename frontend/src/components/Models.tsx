import {
    Cpu, Activity, Zap
} from 'lucide-react';
import { Button } from './ui/button';

export const Models = () => {
    const models = [
        { name: "GPT-4 Turbo", provider: "OpenAI", type: "Reasoning", status: "Operational", latency: "1.2s", usage: "High" },
        { name: "Claude 3.5 Sonnet", provider: "Anthropic", type: "Reasoning", status: "Operational", latency: "0.8s", usage: "Very High" },
        { name: "Llama 3 70B", provider: "Meta", type: "Fast Chat", status: "Operational", latency: "0.4s", usage: "Medium" },
        { name: "Gemini 1.5 Pro", provider: "Google", type: "Context", status: "Maintenance", latency: "-", usage: "Low" },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Model Registry</h1>
                    <p className="text-slate-500 mt-1">Configure and monitor active AI models</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Activity className="w-4 h-4" /> View Analytics
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map((model, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${model.status === 'Operational'
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                }`}>
                                {model.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">{model.name}</h3>
                        <p className="text-sm text-slate-500 mb-6">{model.provider}</p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1">Latency</div>
                                <div className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-amber-500" /> {model.latency}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1">Usage</div>
                                <div className="text-sm font-semibold text-slate-700">{model.usage}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
