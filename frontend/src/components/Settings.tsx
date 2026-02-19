import {
    User, Lock, Bell, CreditCard, Palette
} from 'lucide-react';
import { Button } from './ui/button';

export const Settings = () => {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your workspace preferences</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation for Settings */}
                <div className="w-full md:w-64 shrink-0 space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-2 bg-slate-100 text-slate-900 font-medium">
                        <User className="w-4 h-4" /> Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <Lock className="w-4 h-4" /> Security
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <Bell className="w-4 h-4" /> Notifications
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <CreditCard className="w-4 h-4" /> Billing
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <Palette className="w-4 h-4" /> Appearance
                    </Button>
                </div>

                {/* Main Settings Content */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Public Profile</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400">
                                    JD
                                </div>
                                <Button variant="outline" size="sm">Change Avatar</Button>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-700">Display Name</label>
                                <input type="text" defaultValue="John Doe" className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <input type="email" defaultValue="john@samvad.ai" className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-700">Bio</label>
                                <textarea className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue="Senior Software Architect focused on scalable systems." />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline">Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
