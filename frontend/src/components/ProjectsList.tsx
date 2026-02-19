import {
    FolderGit2, MoreVertical, Calendar, User, Search, Filter
} from 'lucide-react';
import { Button } from './ui/button';

export const ProjectsList = ({ onNewProject }: { onNewProject: () => void }) => {
    const projects = [
        { name: "E-Commerce Microservices", desc: "Scalable backend for multi-vendor marketplace", updated: "2h ago", owner: "John Doe", status: "In Progress" },
        { name: "Healthcare CRM", desc: "Patient management system with HIPAA compliance", updated: "5h ago", owner: "Sarah Smith", status: "Review" },
        { name: "FinTech Payment Gateway", desc: "Secure transaction processing layer", updated: "1d ago", owner: "Mike Johnson", status: "Completed" },
        { name: "Logistics Tracker", desc: "Real-time fleet tracking and optimization", updated: "2d ago", owner: "John Doe", status: "Draft" },
        { name: "Social Media Analytics", desc: "Big data processing pipeline for engagement metrics", updated: "1w ago", owner: "John Doe", status: "Archived" },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
                    <p className="text-slate-500 mt-1">Manage and organize your architecture specifications</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={onNewProject}>
                    + New Project
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>
                <Button variant="outline" className="gap-2 text-slate-600">
                    <Filter className="w-4 h-4" /> Filter
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, i) => (
                    <div key={i} className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                <FolderGit2 className="w-5 h-5" />
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </div>

                        <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2">{project.desc}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> {project.owner}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> {project.updated}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
