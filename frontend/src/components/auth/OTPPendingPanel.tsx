import { useState } from 'react';
import { Loader2, RefreshCw, Mail, LogOut } from 'lucide-react';

interface OTPPendingPanelProps {
    email: string;
    onResend: () => Promise<void>;
    onCheckVerified: () => void;
    onSignOut: () => Promise<void>;
}

export const OTPPendingPanel = ({ email, onResend, onCheckVerified, onSignOut }: OTPPendingPanelProps) => {
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSent, setResendSent] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(false);

    const handleResend = async () => {
        if (resendCooldown) return;
        setResendLoading(true);
        try {
            await onResend();
            setResendSent(true);
            setResendCooldown(true);
            // 60 second cooldown
            setTimeout(() => {
                setResendCooldown(false);
                setResendSent(false);
            }, 60_000);
        } catch {
            // silent
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="space-y-6 text-center">
            {/* Icon */}
            <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <Mail className="w-9 h-9 text-indigo-500" />
                </div>
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                    1
                </span>
            </div>

            {/* Copy */}
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verify your email</h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                    We sent a verification link to{' '}
                    <span className="font-semibold text-slate-700">{email}</span>.
                    Click the link in the email to activate your account.
                </p>
            </div>

            {/* Steps */}
            <ol className="text-left space-y-2 bg-slate-50 border border-slate-100 rounded-xl p-4">
                {['Check your inbox (and spam folder)', 'Click the verification link', 'Come back here and press \'Continue\''].map((step, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {i + 1}
                        </span>
                        {step}
                    </li>
                ))}
            </ol>

            {/* Continue */}
            <button
                onClick={onCheckVerified}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.99] transition-all duration-200"
            >
                <RefreshCw className="w-4 h-4" />
                I've verified — Continue
            </button>

            {/* Resend */}
            <div className="text-sm text-slate-500">
                Didn't receive the email?{' '}
                {resendSent ? (
                    <span className="text-emerald-600 font-medium">Sent! Check your inbox.</span>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={resendLoading || resendCooldown}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resendLoading ? (
                            <span className="flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Sending...
                            </span>
                        ) : (
                            'Resend email'
                        )}
                    </button>
                )}
            </div>

            {/* Sign out */}
            <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mx-auto transition-colors"
            >
                <LogOut className="w-3.5 h-3.5" />
                Sign out and use a different account
            </button>
        </div>
    );
};
