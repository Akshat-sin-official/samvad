import {
    LayoutGrid, Clock, Users, Database,
    BarChart3, Activity, Zap
} from 'lucide-react';
import { Button } from './ui/button';

export const Dashboard = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 mt-2">Welcome back, John. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Clock className="w-4 h-4" /> History
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm gap-2" onClick={() => onNavigate('new_project')}>
                        <Zap className="w-4 h-4" /> New Project
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Projects", value: "12", icon: LayoutGrid, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Total Artifacts", value: "1,284", icon: Database, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Team Members", value: "8", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "API Usage", value: "94%", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-slate-500" /> Recent Activity
                    </h3>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">View All</Button>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { action: "Generated Architecture", project: "E-Commerce Microservices", time: "2 hours ago", user: "You" },
                        { action: "Updated Data Model", project: "Healthcare CRM", time: "5 hours ago", user: "Sarah Smith" },
                        { action: "Compliance Scan", project: "FinTech Payment Gateway", time: "1 day ago", user: "Mike Johnson" },
                        { action: "New Project Created", project: "Logistics Tracker", time: "2 days ago", user: "You" },
                    ].map((item, i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {item.user.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{item.action}</p>
                                    <p className="text-xs text-slate-500">in <span className="font-medium text-slate-700">{item.project}</span></p>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 font-medium">{item.time}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
