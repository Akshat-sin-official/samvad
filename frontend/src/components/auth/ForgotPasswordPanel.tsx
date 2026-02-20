import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface ForgotPasswordPanelProps {
    onSendReset: (email: string) => Promise<void>;
    onGoToLogin: () => void;
}

export const ForgotPasswordPanel = ({ onSendReset, onGoToLogin }: ForgotPasswordPanelProps) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setError(null);
        setLoading(true);
        try {
            await onSendReset(email);
            setSent(true);
        } catch (err: unknown) {
            const e = err as { code?: string };
            if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-email') {
                setError('No account found with this email address.');
            } else {
                setError('Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="space-y-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Check your inbox</h2>
                    <p className="text-sm text-slate-500 mt-2">
                        We sent a password reset link to <span className="font-semibold text-slate-700">{email}</span>. It may take a minute to arrive.
                    </p>
                </div>
                <button
                    onClick={onGoToLogin}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all duration-200"
                >
                    Back to Sign in <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div>
                <button
                    onClick={onGoToLogin}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to sign in
                </button>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reset your password</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Enter your email and we'll send you a reset link.
                </p>
            </div>

            {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0v-4.5a.75.75 0 00-1.5 0v4.5zm.75-8.25a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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

                <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send reset link <ArrowRight className="w-4 h-4" /></>}
                </button>
            </form>
        </div>
    );
};
