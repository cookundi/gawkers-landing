'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const TWITTER_HANDLE = 'gawksoneth';
const FOLLOW_URL = `https://x.com/intent/follow?screen_name=${TWITTER_HANDLE}`;
const QUOTE_TWEET_URL = 'https://x.com/gawksoneth'; // replace with actual tweet
const COMMENT_TWEET_URL = 'https://x.com/gawksoneth'; // replace with actual tweet
const SPOTS_LEFT = 778;
const UNLOCK_DELAY = 3500; // ms after clicking X button before input unlocks

type Step = 1 | 2 | 3 | 4 | 5;
interface FormData {
    twitter_handle: string;
    quote_link: string;
    comment_link: string;
    wallet_address: string;
    reason: string;
}

function CheckIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    );
}
function CopyIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
    );
}
function XIcon() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function ApplyContent() {
    const searchParams = useSearchParams();
    const referredBy = searchParams.get('invite') || '';

    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState<FormData>({
        twitter_handle: '', quote_link: '', comment_link: '', wallet_address: '', reason: '',
    });
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [copied, setCopied] = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);

    // Per-step input unlock state: steps 1, 2, 3 require clicking X button first
    const [unlocked, setUnlocked] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false });
    const [countdown, setCountdown] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 });
    const timersRef = useRef<Record<number, any>>({});

    // Build referral link dynamically from browser URL
    const referralLink = typeof window !== 'undefined'
        ? `${window.location.origin}/gawklist-application?invite=${formData.twitter_handle || 'you'}`
        : `/gawklist-application?invite=${formData.twitter_handle || 'you'}`;

    const update = (field: keyof FormData, val: string) => {
        setFormData(prev => ({ ...prev, [field]: val }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // Click X button for steps 1/2/3 — starts countdown then unlocks input
    const handleXClick = (s: number) => {
        if (unlocked[s]) return;
        setCountdown(prev => ({ ...prev, [s]: UNLOCK_DELAY / 1000 }));

        // Countdown tick
        let remaining = Math.ceil(UNLOCK_DELAY / 1000);
        const tick = setInterval(() => {
            remaining--;
            setCountdown(prev => ({ ...prev, [s]: remaining }));
            if (remaining <= 0) clearInterval(tick);
        }, 1000);

        // Unlock after delay
        timersRef.current[s] = setTimeout(() => {
            setUnlocked(prev => ({ ...prev, [s]: true }));
            setCountdown(prev => ({ ...prev, [s]: 0 }));
        }, UNLOCK_DELAY);
    };

    useEffect(() => {
        return () => Object.values(timersRef.current).forEach(clearTimeout);
    }, []);

    const validateStep = (): boolean => {
        const e: Partial<FormData> = {};
        if (step === 1) {
            const h = formData.twitter_handle.replace('@', '').trim();
            if (!h) e.twitter_handle = 'X handle required';
            else if (!/^[a-zA-Z0-9_]{1,15}$/.test(h)) e.twitter_handle = 'Invalid X handle';
        }
        if (step === 2) {
            if (!formData.quote_link.trim()) e.quote_link = 'Paste your quote tweet link';
            else if (!formData.quote_link.includes('x.com') && !formData.quote_link.includes('twitter.com')) e.quote_link = 'Must be an X/Twitter link';
        }
        if (step === 3) {
            if (!formData.comment_link.trim()) e.comment_link = 'Paste your comment link';
            else if (!formData.comment_link.includes('x.com') && !formData.comment_link.includes('twitter.com')) e.comment_link = 'Must be an X/Twitter link';
        }
        if (step === 4) {
            if (!formData.wallet_address.trim()) e.wallet_address = 'Wallet address required';
            else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.wallet_address.trim())) e.wallet_address = 'Invalid EVM address (must start with 0x, 42 chars)';
        }
        if (step === 5) {
            if (formData.reason.trim().length < 20) e.reason = 'Tell us more (at least 20 characters)';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = async () => {
        if (!validateStep()) return;
        if (step === 1) {
            const handle = formData.twitter_handle.replace('@', '').toLowerCase();
            try {
                const res = await fetch(`/api/apply?handle=${handle}`);
                const data = await res.json();
                if (data.exists) { setAlreadyApplied(true); return; }
            } catch {}
        }
        if (step < 5) setStep((step + 1) as Step);
        else await handleSubmit();
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            const res = await fetch('/api/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, referred_by: referredBy }),
            });
            const data = await res.json();
            if (!res.ok) { setSubmitError(data.error || 'Submission failed'); return; }
            setSubmitted(true);
        } catch { setSubmitError('Network error, please try again'); }
        finally { setSubmitting(false); }
    };

    const copyReferral = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const STEPS = [
        { num: 1, label: 'Follow' }, { num: 2, label: 'Quote' },
        { num: 3, label: 'Comment' }, { num: 4, label: 'Wallet' }, { num: 5, label: 'Why You?' },
    ];

    // Locked input overlay styles
    const lockedStyle: React.CSSProperties = {
        filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.4,
    };

    if (submitted) {
        const finalReferralLink = typeof window !== 'undefined'
            ? `${window.location.origin}/gawklist-application?invite=${formData.twitter_handle}`
            : `/gawklist-application?invite=${formData.twitter_handle}`;

        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-5 relative overflow-hidden">
                <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,#0d001a,#050505)] pointer-events-none" />
                <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
                <div className="relative z-10 w-full max-w-lg text-center">
                    <div className="relative mx-auto mb-8 w-24 h-24">
                        <div className="absolute inset-0 border-2 border-[#A020F0]/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-2 border-2 border-[#A020F0]/20 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
                        <div className="w-24 h-24 border-2 border-[#A020F0] rounded-full flex items-center justify-center bg-[#A020F0]/10">
                            <CheckIcon size={36} />
                        </div>
                    </div>
                    <div className="font-mono text-[#A020F0] uppercase mb-2" style={{ fontSize: 10, letterSpacing: '0.3em' }}>Application Received</div>
                    <h2 className="text-4xl font-bold italic font-pixel mb-2">GawkList</h2>
                    <h3 className="text-2xl font-bold italic font-pixel text-[#A020F0] mb-6">Application Submitted.</h3>
                    <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-10">
                        Your application is under review. Boost your chances by referring friends, every authentic invite improves your position in the review queue.
                    </p>
                    <div className="border border-[#A020F0]/20 bg-[#A020F0]/[0.03] p-6 mb-6 text-left">
                        <div className="font-mono text-[#A020F0] uppercase mb-3" style={{ fontSize: 10, letterSpacing: '0.2em' }}>Your Referral Link</div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/40 border border-white/[0.06] px-3 py-2 font-mono text-zinc-400 truncate" style={{ fontSize: 11 }}>
                                {finalReferralLink}
                            </div>
                            <button onClick={copyReferral}
                                className="flex items-center gap-2 border px-3 py-2 font-mono uppercase transition-all shrink-0"
                                style={{ fontSize: 10, letterSpacing: '0.1em', borderColor: copied ? '#22c55e' : 'rgba(160,32,240,0.3)', color: copied ? '#22c55e' : '#A020F0' }}>
                                <CopyIcon /> {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p className="font-mono text-zinc-700 mt-3" style={{ fontSize: 10 }}>
                            Share this link. Each friend who completes their application counts toward your referral score.
                        </p>
                    </div>
                    <a href="/" className="font-mono text-zinc-600 uppercase hover:text-white transition-colors no-underline block" style={{ fontSize: 10 }}>← Back to Gawkers</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center relative overflow-x-hidden">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#0d001a,#050505)] pointer-events-none" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

            <nav className="relative z-10 w-full border-b border-white/[0.04] px-5 sm:px-8 py-4 flex justify-between items-center">
                <a href="/" className="font-pixel font-bold text-[#A020F0] no-underline" style={{ fontSize: 18 }}>GAWKERS.</a>
                <div className="font-mono text-zinc-600 uppercase" style={{ fontSize: 10, letterSpacing: '0.2em' }}>GawkList Application</div>
            </nav>

            <div className="relative z-10 w-full max-w-xl px-5 sm:px-8 py-10 sm:py-16">
                <div className="mb-10">
                    <div className="font-mono text-[#A020F0] uppercase mb-2" style={{ fontSize: 10, letterSpacing: '0.25em' }}>
                        Paid Mint Phase · {SPOTS_LEFT} Spots Left
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold italic font-pixel tracking-tighter mb-3">
                        GawkList<br /><span className="text-[#A020F0]">Application.</span>
                    </h1>
                    <p className="font-mono text-zinc-500 text-sm leading-relaxed">
                        Community legends, collab winners, and loyal supporters. Apply to be considered for the GawkList mint phase.
                    </p>
                    {referredBy && (
                        <div className="mt-4 inline-flex items-center gap-2 border border-[#A020F0]/20 bg-[#A020F0]/5 px-3 py-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A020F0] animate-pulse" />
                            <span className="font-mono text-[#A020F0]" style={{ fontSize: 10, letterSpacing: '0.1em' }}>
                                Referred by @{referredBy}
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div className="mb-10">
                    <div className="flex items-center gap-0 mb-3">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s.num}>
                                <div className="flex flex-col items-center">
                                    <div className="w-7 h-7 flex items-center justify-center font-mono font-bold transition-all duration-300"
                                        style={{
                                            fontSize: 10,
                                            background: step > s.num ? '#A020F0' : 'transparent',
                                            border: `1.5px solid ${step > s.num ? '#A020F0' : step === s.num ? '#A020F0' : '#27272a'}`,
                                            color: step > s.num ? '#000' : step === s.num ? '#A020F0' : '#444',
                                            boxShadow: step === s.num ? '0 0 12px rgba(160,32,240,0.4)' : 'none',
                                        }}>
                                        {step > s.num ? <CheckIcon size={12} /> : s.num}
                                    </div>
                                    <span className="font-mono uppercase mt-1" style={{ fontSize: 8, letterSpacing: '0.1em', color: step === s.num ? '#A020F0' : step > s.num ? '#555' : '#333' }}>{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className="flex-1 h-px mx-1 mt-[-12px] transition-all duration-500" style={{ background: step > s.num ? '#A020F0' : '#1a1a1a' }} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="h-px bg-white/[0.04] w-full">
                        <div className="h-full bg-[#A020F0] transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }} />
                    </div>
                </div>

                <div className="border border-white/[0.06] bg-white/[0.015] p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#A020F0]/30" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#A020F0]/30" />

                    {/* ── STEP 1: Follow + Handle ── */}
                    {step === 1 && (
                        <div>
                            <div className="font-mono text-zinc-600 uppercase mb-1" style={{ fontSize: 9, letterSpacing: '0.2em' }}>Step 1 of 5</div>
                            <h2 className="text-2xl font-bold italic font-pixel mb-1">Follow Us</h2>
                            <p className="font-mono text-zinc-500 text-xs leading-relaxed mb-6">
                                Follow @gawksoneth on X, then enter your handle below.
                            </p>

                            <a href={FOLLOW_URL} target="_blank" rel="noopener noreferrer"
                                onClick={() => handleXClick(1)}
                                className="flex items-center justify-center gap-2 w-full no-underline font-pixel font-bold uppercase mb-6 transition-all"
                                style={{
                                    padding: '14px 24px', fontSize: 13, letterSpacing: '0.05em',
                                    background: unlocked[1] ? 'rgba(34,197,94,0.1)' : '#fff',
                                    color: unlocked[1] ? '#22c55e' : '#000',
                                    border: unlocked[1] ? '1px solid rgba(34,197,94,0.3)' : 'none',
                                }}>
                                {unlocked[1] ? <><CheckIcon size={14} /> Followed @gawksoneth</> : <><XIcon /> Follow @gawksoneth on X</>}
                            </a>

                            <label className="font-mono text-zinc-500 uppercase block mb-2" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Your X Handle</label>
                            <div style={!unlocked[1] ? lockedStyle : {}}>
                                <div className="flex">
                                    <span className="bg-zinc-900 border border-r-0 border-white/[0.06] px-3 flex items-center text-zinc-500 font-mono" style={{ fontSize: 14 }}>@</span>
                                    <input
                                        type="text"
                                        value={formData.twitter_handle}
                                        onChange={e => update('twitter_handle', e.target.value.replace('@', ''))}
                                        placeholder="yourhandle"
                                        maxLength={15}
                                        disabled={!unlocked[1]}
                                        className="flex-1 bg-zinc-900 border border-white/[0.06] px-4 py-3 font-mono text-white outline-none focus:border-[#A020F0]/50 transition-colors"
                                        style={{ fontSize: 14 }}
                                    />
                                </div>
                            </div>
                            {!unlocked[1] && countdown[1] > 0 && (
                                <p className="font-mono text-zinc-600 mt-2" style={{ fontSize: 10 }}>
                                    Input unlocks in {countdown[1]}s...
                                </p>
                            )}
                            {errors.twitter_handle && <p className="font-mono text-red-400 mt-2" style={{ fontSize: 11 }}>{errors.twitter_handle}</p>}
                            {alreadyApplied && (
                                <p className="font-mono text-yellow-400 mt-2" style={{ fontSize: 11 }}>
                                    @{formData.twitter_handle} has already submitted an application.
                                </p>
                            )}
                        </div>
                    )}

                    {/* ── STEP 2: Quote Tweet ── */}
                    {step === 2 && (
                        <div>
                            <div className="font-mono text-zinc-600 uppercase mb-1" style={{ fontSize: 9, letterSpacing: '0.2em' }}>Step 2 of 5</div>
                            <h2 className="text-2xl font-bold italic font-pixel mb-1">Quote Tweet</h2>
                            <p className="font-mono text-zinc-500 text-xs leading-relaxed mb-6">
                                Like and quote our announcement post. Include <span className="text-white">#Gawkers</span> in your quote and tag a friend. Paste your quote tweet link below.
                            </p>
                            <a href={QUOTE_TWEET_URL} target="_blank" rel="noopener noreferrer"
                                onClick={() => handleXClick(2)}
                                className="flex items-center justify-center gap-2 w-full no-underline font-pixel font-bold uppercase mb-6 bg-white text-black hover:bg-[#A020F0] hover:text-black transition-all"
                                style={{ padding: '14px 24px', fontSize: 13, letterSpacing: '0.05em' }}>
                                <XIcon /> Open Tweet to Like &amp; Quote
                            </a>
                            <label className="font-mono text-zinc-500 uppercase block mb-2" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Your Quote Tweet Link</label>
                            <div style={!unlocked[2] ? lockedStyle : {}}>
                                <input
                                    type="url"
                                    value={formData.quote_link}
                                    onChange={e => update('quote_link', e.target.value)}
                                    placeholder="https://x.com/you/status/..."
                                    disabled={!unlocked[2]}
                                    className="w-full bg-zinc-900 border border-white/[0.06] px-4 py-3 font-mono text-white outline-none focus:border-[#A020F0]/50 transition-colors"
                                    style={{ fontSize: 12 }}
                                />
                            </div>
                            {!unlocked[2] && countdown[2] > 0 && (
                                <p className="font-mono text-zinc-600 mt-2" style={{ fontSize: 10 }}>Input unlocks in {countdown[2]}s...</p>
                            )}
                            {errors.quote_link && <p className="font-mono text-red-400 mt-2" style={{ fontSize: 11 }}>{errors.quote_link}</p>}
                        </div>
                    )}

                    {/* ── STEP 3: Comment ── */}
                    {step === 3 && (
                        <div>
                            <div className="font-mono text-zinc-600 uppercase mb-1" style={{ fontSize: 9, letterSpacing: '0.2em' }}>Step 3 of 5</div>
                            <h2 className="text-2xl font-bold italic font-pixel mb-1">Drop a Comment</h2>
                            <p className="font-mono text-zinc-500 text-xs leading-relaxed mb-6">
                                Leave a comment on our pinned post. Say something real, our team reads every one. Paste your comment link below.
                            </p>
                            <a href={COMMENT_TWEET_URL} target="_blank" rel="noopener noreferrer"
                                onClick={() => handleXClick(3)}
                                className="flex items-center justify-center gap-2 w-full no-underline font-pixel font-bold uppercase mb-6 bg-white text-black hover:bg-[#A020F0] hover:text-black transition-all"
                                style={{ padding: '14px 24px', fontSize: 13, letterSpacing: '0.05em' }}>
                                <XIcon /> Open Post to Comment
                            </a>
                            <label className="font-mono text-zinc-500 uppercase block mb-2" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Your Comment Link</label>
                            <div style={!unlocked[3] ? lockedStyle : {}}>
                                <input
                                    type="url"
                                    value={formData.comment_link}
                                    onChange={e => update('comment_link', e.target.value)}
                                    placeholder="https://x.com/you/status/..."
                                    disabled={!unlocked[3]}
                                    className="w-full bg-zinc-900 border border-white/[0.06] px-4 py-3 font-mono text-white outline-none focus:border-[#A020F0]/50 transition-colors"
                                    style={{ fontSize: 12 }}
                                />
                            </div>
                            {!unlocked[3] && countdown[3] > 0 && (
                                <p className="font-mono text-zinc-600 mt-2" style={{ fontSize: 10 }}>Input unlocks in {countdown[3]}s...</p>
                            )}
                            {errors.comment_link && <p className="font-mono text-red-400 mt-2" style={{ fontSize: 11 }}>{errors.comment_link}</p>}
                        </div>
                    )}

                    {/* ── STEP 4: Wallet ── */}
                    {step === 4 && (
                        <div>
                            <div className="font-mono text-zinc-600 uppercase mb-1" style={{ fontSize: 9, letterSpacing: '0.2em' }}>Step 4 of 5</div>
                            <h2 className="text-2xl font-bold italic font-pixel mb-1">EVM Wallet</h2>
                            <p className="font-mono text-zinc-500 text-xs leading-relaxed mb-6">
                                Enter the EVM wallet address where you'd receive your mint. Must start with <span className="text-white">0x</span>, 42 characters total. We will never ask for your private key.
                            </p>
                            <label className="font-mono text-zinc-500 uppercase block mb-2" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Wallet Address</label>
                            <input
                                type="text"
                                value={formData.wallet_address}
                                onChange={e => update('wallet_address', e.target.value.trim())}
                                placeholder="0x..."
                                maxLength={42}
                                className="w-full bg-zinc-900 border border-white/[0.06] px-4 py-3 font-mono text-white outline-none focus:border-[#A020F0]/50 transition-colors"
                                style={{ fontSize: 12, letterSpacing: '0.05em' }}
                            />
                            <div className="flex justify-between mt-1">
                                {errors.wallet_address ? <p className="font-mono text-red-400" style={{ fontSize: 11 }}>{errors.wallet_address}</p> : <span />}
                                <span className="font-mono text-zinc-700" style={{ fontSize: 10 }}>{formData.wallet_address.length}/42</span>
                            </div>
                            <div className="mt-4 border border-yellow-500/10 bg-yellow-500/[0.03] p-3">
                                <p className="font-mono text-yellow-700 text-xs leading-relaxed">⚠ Use a wallet you control. We will NEVER ask for your seed phrase or private key.</p>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 5: Why? ── */}
                    {step === 5 && (
                        <div>
                            <div className="font-mono text-zinc-600 uppercase mb-1" style={{ fontSize: 9, letterSpacing: '0.2em' }}>Step 5 of 5</div>
                            <h2 className="text-2xl font-bold italic font-pixel mb-1">Why You?</h2>
                            <p className="font-mono text-zinc-500 text-xs leading-relaxed mb-6">
                                Tell us why you want to mint a Gawker. What draws you to the project? What would you bring to the community? Be genuine, our team reads every response.
                            </p>
                            <textarea
                                value={formData.reason}
                                onChange={e => update('reason', e.target.value)}
                                placeholder="I want to mint a Gawker because..."
                                rows={5}
                                maxLength={500}
                                className="w-full bg-zinc-900 border border-white/[0.06] px-4 py-3 font-mono text-white outline-none focus:border-[#A020F0]/50 transition-colors resize-none"
                                style={{ fontSize: 12 }}
                            />
                            <div className="flex justify-between mt-1">
                                {errors.reason ? <p className="font-mono text-red-400" style={{ fontSize: 11 }}>{errors.reason}</p> : <span />}
                                <span className="font-mono text-zinc-700" style={{ fontSize: 10 }}>{formData.reason.length}/500</span>
                            </div>
                            {submitError && <p className="font-mono text-red-400 mt-3" style={{ fontSize: 11 }}>{submitError}</p>}
                        </div>
                    )}

                    {/* Nav */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.04]">
                        {step > 1
                            ? <button onClick={() => setStep((step - 1) as Step)} className="font-mono uppercase text-zinc-600 hover:text-white transition-colors bg-transparent border-none cursor-pointer" style={{ fontSize: 10, letterSpacing: '0.1em' }}>← Back</button>
                            : <a href="/" className="font-mono uppercase text-zinc-600 hover:text-white transition-colors no-underline" style={{ fontSize: 10 }}>← Cancel</a>
                        }
                        <button onClick={nextStep} disabled={submitting}
                            className="font-pixel font-bold uppercase transition-all disabled:opacity-50"
                            style={{ padding: '14px 36px', fontSize: 13, letterSpacing: '0.05em', background: submitting ? '#333' : '#A020F0', color: '#000', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                            {submitting ? 'Submitting...' : step === 5 ? 'Submit Application' : 'Continue →'}
                        </button>
                    </div>
                </div>

                <p className="font-mono text-zinc-700 text-center mt-6" style={{ fontSize: 10 }}>
                    GawkLord is reserved for Top 300 Gauntlet players only. This form is for GawkList Phase.
                </p>
            </div>
        </div>
    );
}

export default function ApplyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="font-pixel text-[#A020F0] animate-pulse">Loading...</div>
            </div>
        }>
            <ApplyContent />
        </Suspense>
    );
}