import { useEffect, useState } from 'react';
import { User, Lock, Bell, CreditCard, Palette, LogOut, X } from 'lucide-react';
import { Button } from './ui/button';
import { fetchCurrentUser, updateUserSettings, setup2FA, enable2FA, disable2FA } from '../api/client';
import { useAuth } from '../auth';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

type SettingsSection = 'profile' | 'security' | 'notifications' | 'billing' | 'appearance';

const sections: { id: SettingsSection; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function Settings() {
  const { signOutUser, user: authUser } = useAuth();
  const [active, setActive] = useState<SettingsSection>('profile');
  const [displayName, setDisplayName] = useState('John Doe');
  const [email, setEmail] = useState('john@samvad.ai');
  const [bio, setBio] = useState('Senior Software Architect focused on scalable systems.');
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'System'>('Light');
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    brdComplete: true,
    teamInvites: true,
    weeklyDigest: true,
  });

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch {
      // Ignore sign out errors
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetchCurrentUser();
        setDisplayName(me.displayName || displayName);
        setEmail(me.email || email);
        const settings = me.settings || {};
        setBio(settings.bio || bio);
        setTheme((settings.appearance as 'Light' | 'Dark' | 'System') || 'Light');
        setNotifications(settings.notifications || notifications);
        setIs2FAEnabled(settings.is2faEnabled || false);
      } catch {
        // Fall back to Firebase auth user when /users/me returns 404
        if (authUser) {
          setDisplayName(authUser.displayName || 'User');
          setEmail(authUser.email || '');
        }
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.uid]);

  const persistSettings = async () => {
    try {
      await updateUserSettings({
        displayName,
        bio,
        appearance: theme,
        notifications,
      });
      showToast('Settings saved successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings.', 'error');
    }
  };

  const updateUserPassword = async () => {
    if (!newPassword || !confirmPassword || !currentPassword) {
      showToast('Please fill out all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (!authUser || !authUser.email) {
      showToast('You must be logged in to update your password.', 'error');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(authUser.email, currentPassword);

      // Re-authenticate first
      await reauthenticateWithCredential(authUser, credential);

      // Then update password
      await updatePassword(authUser, newPassword);
      showToast('Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password update failed:', err);
      if (err.code === 'auth/invalid-credential') {
        showToast('Incorrect current password.', 'error');
      } else if (err.code === 'auth/weak-password') {
        showToast('New password is too weak.', 'error');
      } else {
        showToast(err.message || 'Failed to update password. Please try logging in again.', 'error');
      }
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await setup2FA();
      setQrCodeUrl(response.qrCodeUrl);
      setShow2FASetup(true);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to initialize 2FA setup.', 'error');
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode) return;
    try {
      await enable2FA(verificationCode);
      setIs2FAEnabled(true);
      setShow2FASetup(false);
      setVerificationCode('');
      showToast('Two-factor authentication enabled successfully.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Invalid verification code.', 'error');
    }
  };

  const handleDisable2FA = async () => {
    try {
      await disable2FA();
      setIs2FAEnabled(false);
      showToast('Two-factor authentication disabled.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to disable 2FA.', 'error');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your workspace preferences</p>
      </div>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full bg-white border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] animate-in slide-in-from-top-4 fade-in duration-300">
          {toast.type === 'success' ? (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          )}
          <p className="text-[13px] text-slate-600 font-medium tracking-wide flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="opacity-40 hover:opacity-100 transition-opacity ml-2">
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <nav className="w-full md:w-56 shrink-0 space-y-0.5">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${active === id
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
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500 uppercase">
                      {displayName ? displayName[0] : (email ? email[0] : 'U')}
                    </div>
                    <Button variant="outline" size="sm">
                      Change avatar
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Display name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400">Email is managed via your authentication provider.</p>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={persistSettings}>Save changes</Button>
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
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Confirm new password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-1">Two-factor authentication</h2>
                    <p className="text-sm text-slate-500 mb-4">Add an extra layer of security to your account.</p>
                  </div>
                  {is2FAEnabled && (
                    <span className="inline-flex items-center px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-600">
                      Enabled
                    </span>
                  )}
                </div>

                {!is2FAEnabled ? (
                  !show2FASetup ? (
                    <Button variant="outline" size="sm" onClick={handleEnable2FA}>
                      Enable 2FA
                    </Button>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-300">
                      <p className="text-sm text-slate-600 mb-4">Scan the QR code with your authenticator app to get started.</p>
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-32 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-2">
                          {qrCodeUrl ? (
                            <img src={qrCodeUrl} alt="2FA QR Code" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full animate-pulse bg-slate-200 rounded" />
                          )}
                        </div>
                        <div className="flex-1 max-w-xs">
                          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Verification code</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              placeholder="000000"
                              className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 transition-shadow text-center tracking-widest font-mono"
                              maxLength={6}
                            />
                            <Button
                              size="sm"
                              className="bg-slate-900 hover:bg-slate-800 text-white shadow-none h-9"
                              onClick={handleVerify2FA}
                              disabled={verificationCode.length < 6}
                            >
                              Verify
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 mt-2 p-0 h-auto" onClick={() => setShow2FASetup(false)}>Cancel setup</Button>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <Button variant="outline" size="sm" className="text-slate-500 hover:text-slate-700" onClick={handleDisable2FA}>
                    Disable 2FA
                  </Button>
                )}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Sign out</h2>
                <p className="text-sm text-slate-500 mb-4">Sign out of your account on this device.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={updateUserPassword}>Update password</Button>
              </div>
            </div>
          )}

          {active === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Email notifications</h2>
                <div className="space-y-4">
                  {[
                    { key: 'brdComplete', label: 'BRD generation complete', desc: 'When a new spec is ready' },
                    { key: 'teamInvites', label: 'Team invites', desc: 'When someone invites you to a workspace' },
                    { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Summary of activity' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications] ?? true}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={persistSettings}>Save preferences</Button>
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
                  <Button variant="outline" size="sm" className="shrink-0" onClick={() => showToast('Please contact your account manager to change plans.', 'success')}>
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
                  <Button variant="ghost" size="sm" className="ml-auto text-slate-500" onClick={() => showToast('Please contact your account manager to update billing.', 'success')}>
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
                      className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${theme === 'Light'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      onClick={() => setTheme(theme as 'Light' | 'Dark' | 'System')}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={persistSettings}>Save</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
