import { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Zap, GitBranch } from 'lucide-react';
import { useAuth } from '../../auth';
import { LoginPanel } from './LoginPanel';
import { SignupPanel } from './SignupPanel';
import { ForgotPasswordPanel } from './ForgotPasswordPanel';
import { OTPPendingPanel } from './OTPPendingPanel';

type AuthView = 'login' | 'signup' | 'forgot' | 'otp-pending';

interface AuthModalProps {
    onClose?: () => void;
    error?: string | null;
}

const features = [
    { icon: Zap, text: 'AI-powered BRD generation in seconds' },
    { icon: GitBranch, text: 'Multi-agent architecture analysis' },
    { icon: ShieldCheck, text: 'SOC 2 compliant & enterprise ready' },
];

export const AuthModal = ({ onClose, error: externalError }: AuthModalProps) => {
    const {
        user,
        signInWithGoogle,
        signUpWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        resendVerificationEmail,
        signOutUser,
    } = useAuth();

    const [view, setView] = useState<AuthView>('login');

    // When a user signs in but their email is unverified, show OTP screen
    useEffect(() => {
        if (user && user.providerData[0]?.providerId === 'password' && !user.emailVerified) {
            setView('otp-pending');
        }
    }, [user]);

    const handleCheckVerified = async () => {
        // Reload user to get fresh emailVerified status
        if (user) {
            await user.reload();
            if (user.emailVerified) {
                // AuthProvider will re-render with the updated user; just close
                onClose?.();
            } else {
                // user is still not verified — give a gentle nudge
                alert('Email not verified yet. Please click the link in your inbox first.');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <div
                className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex"
                style={{ minHeight: '580px', maxHeight: '95vh' }}
            >
                {/* Left Panel — Brand */}
                <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-10 text-white relative overflow-hidden shrink-0">
                    {/* Background decoration */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
                        <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-white/5 rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                    </div>

                    {/* Logo */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Samvad<span className="text-indigo-300">.ai</span></span>
                        </div>
                        <p className="text-indigo-200 text-sm leading-relaxed max-w-xs">
                            The intelligent platform for transforming product ideas into enterprise-grade architecture documents.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="relative z-10 space-y-4">
                        {features.map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 shrink-0">
                                    <Icon className="w-4 h-4 text-indigo-200" />
                                </div>
                                <span className="text-sm text-indigo-100">{text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <p className="relative z-10 text-xs text-indigo-300">
                        © 2026 Samvad.ai · Trusted by 500+ teams
                    </p>
                </div>

                {/* Right Panel — Auth Form */}
                <div className="flex-1 flex flex-col overflow-y-auto">
                    {/* Close button */}
                    {onClose && (
                        <div className="flex justify-end p-5 pb-0">
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    <div className="flex-1 flex items-center p-8 lg:p-10">
                        <div className="w-full max-w-sm mx-auto">
                            {view === 'login' && (
                                <LoginPanel
                                    onGoogleSignIn={signInWithGoogle}
                                    onSignInWithEmail={signInWithEmail}
                                    onForgotPassword={() => setView('forgot')}
                                    onGoToSignup={() => setView('signup')}
                                    generalError={externalError}
                                />
                            )}
                            {view === 'signup' && (
                                <SignupPanel
                                    onGoogleSignUp={signUpWithGoogle}
                                    onSignUpWithEmail={signUpWithEmail}
                                    onGoToLogin={() => setView('login')}
                                />
                            )}
                            {view === 'forgot' && (
                                <ForgotPasswordPanel
                                    onSendReset={sendPasswordReset}
                                    onGoToLogin={() => setView('login')}
                                />
                            )}
                            {view === 'otp-pending' && user && (
                                <OTPPendingPanel
                                    email={user.email || ''}
                                    onResend={resendVerificationEmail}
                                    onCheckVerified={handleCheckVerified}
                                    onSignOut={signOutUser}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
