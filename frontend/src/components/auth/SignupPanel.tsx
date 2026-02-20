import { useState } from 'react';
import { GoogleButton } from './GoogleButton';
import { Eye, EyeOff, ArrowRight, Loader2, Check, X } from 'lucide-react';

interface SignupPanelProps {
    onGoogleSignUp: () => Promise<void>;
    onSignUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    onGoToLogin: () => void;
}

const PasswordRule = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
        {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
        {text}
    </div>
);

export const SignupPanel = ({
    onGoogleSignUp,
    onSignUpWithEmail,
    onGoToLogin,
}: SignupPanelProps) => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const rules = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        number: /\d/.test(password),
    };
    const passwordValid = Object.values(rules).every(Boolean);
    const confirmMatch = confirm === password && confirm !== '';

    const handleGoogleSignUp = async () => {
        setError(null);
        setGoogleLoading(true);
        try {
            await onGoogleSignUp();
        } catch (e: unknown) {
            const err = e as { message?: string };
            setError(err.message || 'Google sign-up failed.');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordValid || !confirmMatch || !displayName.trim()) return;
        setError(null);
        setEmailLoading(true);
        try {
            await onSignUpWithEmail(email, password, displayName.trim());
        } catch (err: unknown) {
            const e = err as { code?: string };
            if (e.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists. Please sign in.');
            } else if (e.code === 'auth/weak-password') {
                setError('Password is too weak. Please choose a stronger password.');
            } else if (e.code === 'auth/invalid-email') {
                setError('Invalid email address. Please check and try again.');
            } else {
                setError('Sign-up failed. Please try again.');
            }
        } finally {
            setEmailLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
                <p className="text-sm text-slate-500">Get started with Samvad.ai for free</p>
            </div>

            {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0v-4.5a.75.75 0 00-1.5 0v4.5zm.75-8.25a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <GoogleButton onClick={handleGoogleSignUp} loading={googleLoading}>
                Sign up with Google
            </GoogleButton>

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">or with email</span>
                <div className="h-px flex-1 bg-slate-100" />
            </div>

            <form onSubmit={handleEmailSignUp} className="space-y-4">
                {/* Display Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full name</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        autoComplete="name"
                        placeholder="Jane Smith"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition-all duration-200"
                    />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition-all duration-200"
                    />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="Min. 8 characters"
                            className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {/* Password strength rules */}
                    {password.length > 0 && (
                        <div className="grid grid-cols-3 gap-1 pt-1">
                            <PasswordRule met={rules.length} text="8+ chars" />
                            <PasswordRule met={rules.upper} text="Uppercase" />
                            <PasswordRule met={rules.number} text="Number" />
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Confirm password</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="Re-enter your password"
                            className={`w-full px-4 py-3 pr-11 rounded-xl border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${confirm.length > 0
                                    ? confirmMatch
                                        ? 'border-emerald-300 bg-emerald-50/40 focus:ring-emerald-400/30 focus:border-emerald-400'
                                        : 'border-red-300 bg-red-50/40 focus:ring-red-400/30 focus:border-red-400'
                                    : 'border-slate-200 bg-slate-50/80 focus:ring-indigo-500/30 focus:border-indigo-400'
                                }`}
                        />
                        {confirm.length > 0 && (
                            <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${confirmMatch ? 'text-emerald-500' : 'text-red-500'}`}>
                                {confirmMatch ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={emailLoading || !displayName || !email || !passwordValid || !confirmMatch}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {emailLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>Create account <ArrowRight className="w-4 h-4" /></>
                    )}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <button
                    onClick={onGoToLogin}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                    Sign in
                </button>
            </p>
        </div>
    );
};
