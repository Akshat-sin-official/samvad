import React from 'react';
import type { DataModel } from '../types';
import { Badge } from './ui/badge';
import { Database, Key, Table as TableIcon } from 'lucide-react';

interface DataModelViewProps {
    data: DataModel;
}

export const DataModelView: React.FC<DataModelViewProps> = ({ data }) => {
    return (
        <div className="space-y-12 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Database className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Schema Design</h2>
                    <p className="text-slate-500 text-sm">Normalized entities and relationships</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {data.entities.map((entity, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TableIcon className="w-4 h-4 text-slate-400" />
                                <h3 className="font-bold text-slate-800 text-lg font-mono">{entity.entity_name}</h3>
                            </div>
                            <Badge variant="outline" className="bg-white text-slate-500 font-normal">
                                {entity.fields.length} Columns
                            </Badge>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 py-3 font-semibold text-slate-500 bg-white w-[25%] pl-8">Column</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500 bg-white w-[20%]">Type</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500 bg-white w-[15%]">Sensitivity</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500 bg-white">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {entity.fields.map((field, fIdx) => (
                                        <tr key={fIdx} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-3 font-medium text-slate-700 pl-8 group-hover:text-indigo-600 transition-colors font-mono text-xs">
                                                {field.field_name}
                                                {field.field_name.endsWith('_id') && <Key className="w-3 h-3 inline ml-2 text-amber-400" />}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                    {field.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge variant="outline" className={`
                                                font-normal text-[10px] px-2 py-0.5 border-0
                                                ${field.sensitivity === 'Public' ? 'bg-emerald-50 text-emerald-700' : ''}
                                                ${field.sensitivity === 'Internal' ? 'bg-blue-50 text-blue-700' : ''}
                                                ${field.sensitivity === 'Confidential' ? 'bg-amber-50 text-amber-700' : ''}
                                                ${field.sensitivity === 'Restricted' ? 'bg-rose-50 text-rose-700' : ''}
                                                ${!['Public', 'Internal', 'Confidential', 'Restricted'].includes(field.sensitivity) ? 'bg-slate-100 text-slate-600' : ''}
                                            `}>
                                                    {field.sensitivity}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 text-slate-500 text-xs leading-relaxed max-w-sm">
                                                {field.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
