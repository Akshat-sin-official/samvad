import { useState } from 'react';
import { User, Lock, Bell, CreditCard, Palette } from 'lucide-react';
import { Button } from './ui/button';

type SettingsSection = 'profile' | 'security' | 'notifications' | 'billing' | 'appearance';

const sections: { id: SettingsSection; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function Settings() {
  const [active, setActive] = useState<SettingsSection>('profile');

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your workspace preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <nav className="w-full md:w-56 shrink-0 space-y-0.5">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                active === id
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {active === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Public profile</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500">
                      JD
                    </div>
                    <Button variant="outline" size="sm">
                      Change avatar
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Display name</label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      defaultValue="john@samvad.ai"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Bio</label>
                    <textarea
                      rows={3}
                      defaultValue="Senior Software Architect focused on scalable systems."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700">Save changes</Button>
              </div>
            </div>
          )}

          {active === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Password</h2>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Current password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">New password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Confirm new password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Two-factor authentication</h2>
                <p className="text-sm text-slate-500 mb-4">Add an extra layer of security to your account.</p>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700">Update password</Button>
              </div>
            </div>
          )}

          {active === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Email notifications</h2>
                <div className="space-y-4">
                  {[
                    { label: 'BRD generation complete', desc: 'When a new spec is ready' },
                    { label: 'Team invites', desc: 'When someone invites you to a workspace' },
                    { label: 'Weekly digest', desc: 'Summary of activity' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700">Save preferences</Button>
              </div>
            </div>
          )}

          {active === 'billing' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Current plan</h2>
                <p className="text-slate-500 text-sm mb-4">You're on the Enterprise plan.</p>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Enterprise</p>
                    <p className="text-sm text-slate-500">Unlimited projects, team features, priority support</p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    Change plan
                  </Button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Payment method</h2>
                <p className="text-sm text-slate-500 mb-4">Manage how you pay for your subscription.</p>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-200">
                  <div className="w-10 h-7 rounded bg-slate-200" />
                  <span className="text-sm font-medium text-slate-700">•••• •••• •••• 4242</span>
                  <Button variant="ghost" size="sm" className="ml-auto text-slate-500">
                    Update
                  </Button>
                </div>
              </div>
            </div>
          )}

          {active === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Theme</h2>
                <p className="text-sm text-slate-500 mb-4">Choose how the app looks. System follows your device.</p>
                <div className="flex gap-3">
                  {['Light', 'Dark', 'System'].map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        theme === 'Light'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
