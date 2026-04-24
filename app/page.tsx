'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Trophy, Gamepad2, Shield, Swords, Zap, Menu, X } from 'lucide-react';

export default function GawkersHub() {
  const [activeSection, setActiveSection] = useState('mission');
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const path = window.location.pathname.replace('/', '');
    if (path) {
      setTimeout(() => {
        const el = document.getElementById(path);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 600);
    }
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `/${id}`);
      setActiveSection(id);
      setMenuOpen(false);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState(null, '', '/');
    setActiveSection('mission');
    setMenuOpen(false);
  }, []);

  const navLinks = [
    { id: 'mission', label: 'Mission' },
    { id: 'mint', label: 'Mint' },
    { id: 'ecosystem', label: 'Ecosystem' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] relative selection:bg-purple-600 selection:text-white font-pixel">
      <div className="bg-grid" />
      <div className="scanlines" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(160,32,240,0.08),transparent_50%)] pointer-events-none z-0" />

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl bg-[#050505]/70 border-b border-white/[0.04]">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center px-5 sm:px-8 py-4 sm:py-5">
          <button type="button" onClick={scrollToTop} className="flex items-center gap-2 bg-transparent border-none cursor-pointer">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-pixel">GAWKERS</span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.id}
                onClick={() => link.id === 'mission' ? scrollToTop() : scrollTo(link.id)}
                className="bg-transparent border-none cursor-pointer font-mono uppercase font-semibold transition-colors flex items-center gap-1.5"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  color: activeSection === link.id ? '#A020F0' : '#52525b',
                }}
              >
                <span
                  className="rounded-full transition-all"
                  style={{
                    width: 6, height: 6,
                    background: activeSection === link.id ? '#A020F0' : '#27272a',
                    boxShadow: activeSection === link.id ? '0 0 8px #A020F0' : 'none',
                  }}
                />
                {link.label}
              </button>
            ))}
            <a href="https://x.com/gawksoneth" target="_blank" rel="noopener noreferrer"
              className="font-mono uppercase text-zinc-500 no-underline border border-white/[0.08] px-3 py-1.5 hover:border-[#A020F0]/40 hover:text-white transition-all"
              style={{ fontSize: 10, letterSpacing: '0.1em' }}>
              𝕏
            </a>
            <a href="https://gauntlet.gawkers.fun" target="_blank" rel="noopener noreferrer"
              className="font-pixel text-xs font-bold uppercase no-underline bg-[#A020F0] text-black px-5 py-2 hover:bg-white transition-all"
              style={{ letterSpacing: '0.05em' }}>
              Play Gauntlet →
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden bg-transparent border-none cursor-pointer text-white p-1"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 top-[57px] bg-[#050505]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.id}
                onClick={() => link.id === 'mission' ? scrollToTop() : scrollTo(link.id)}
                className="bg-transparent border-none cursor-pointer font-pixel text-2xl uppercase font-bold transition-colors"
                style={{ color: activeSection === link.id ? '#A020F0' : '#fff' }}
              >
                {link.label}
              </button>
            ))}
            <div className="flex gap-4 mt-4">
              <a href="https://x.com/gawksoneth" target="_blank" rel="noopener noreferrer"
                className="font-mono uppercase text-zinc-400 no-underline border border-white/[0.1] px-4 py-2"
                style={{ fontSize: 11, letterSpacing: '0.1em' }}
                onClick={() => setMenuOpen(false)}>
                𝕏
              </a>
              <a href="https://gauntlet.gawkers.fun" target="_blank" rel="noopener noreferrer"
                className="font-pixel text-sm font-bold uppercase no-underline bg-[#A020F0] text-black px-6 py-2"
                style={{ letterSpacing: '0.05em' }}
                onClick={() => setMenuOpen(false)}>
                Play Gauntlet →
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ MAIN ═══ */}
      <main className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8">

        {/* ─── HERO ─── */}
        <section id="mission" className="pt-[140px] sm:pt-[180px] pb-[80px] sm:pb-[120px] min-h-screen flex flex-col justify-center relative">
          <div className="fade-up-d2">
            <h2 className="font-bold italic uppercase" style={{ fontSize: 'clamp(36px, 10vw, 120px)', lineHeight: 0.9, marginBottom: 24, letterSpacing: '-0.03em' }}>
              NOT JUST ART.{' '}
              <span className="glitch-wrapper">
                <span className="glitch-text text-[#A020F0]" data-text="A PORTAL.">A PORTAL.</span>
              </span>
            </h2>
          </div>

          <div className="fade-up-d3">
            <p className="text-zinc-500 text-sm sm:text-base md:text-lg max-w-[540px] leading-relaxed mb-10 sm:mb-12 font-medium">
              GAWKERS is a pixel-art gaming powerhouse on Ethereum. We&apos;re fusing high-speed gameplay
              with NFT ownership, building a community of{' '}
              <span className="text-[#A020F0]">players</span>, not just <span className="text-[#A020F0]">collectors</span>.
              Holding a GAWKER grants full access to every title in our pipeline.
            </p>
          </div>

          <div className="fade-up-d4 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <a href="https://gauntlet.gawkers.fun" target="_blank" rel="noopener noreferrer"
              className="pixel-border bg-[#A020F0] text-black font-bold text-sm uppercase no-underline hover:bg-white transition-all flex items-center justify-center gap-2"
              style={{ padding: '16px 32px', letterSpacing: '0.05em' }}>
              <Gamepad2 size={18} /> Enter Gauntlet
            </a>
            <a href="https://x.com/gawksoneth" target="_blank" rel="noopener noreferrer"
              className="border border-white/10 text-white font-bold text-sm uppercase no-underline hover:border-[#A020F0] hover:text-[#A020F0] transition-all flex items-center justify-center"
              style={{ padding: '16px 32px', letterSpacing: '0.05em' }}>
              Follow on 𝕏
            </a>
          </div>

          <div className="absolute bottom-6 sm:bottom-10 left-1/2 animate-float flex flex-col items-center gap-2">
            <span className="font-mono text-gray-300 uppercase" style={{ fontSize: 9, letterSpacing: '0.3em' }}>Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-[#A020F0] to-transparent" />
          </div>
        </section>

        {/* ─── MARQUEE ─── */}
        <div className="overflow-hidden border-y border-white/[0.04] py-3 sm:py-4 mb-[80px] sm:mb-[120px]">
          <div className="marquee-track font-mono text-zinc-300 uppercase" style={{ fontSize: 10, letterSpacing: '0.3em' }}>
            {Array(4).fill('GAWKERS ◆ GAUNTLET ◆ PIXEL-ART ◆ ETH ◆ 1,111 SUPPLY ◆ PLAY TO EARN YOUR MINT ◆ SKILL > EVERYTHING ◆ ').map((t, i) => (
              <span key={i} className="whitespace-nowrap pr-12">{t}</span>
            ))}
          </div>
        </div>

        {/* ─── MINT ─── */}
        <section id="mint" className="mb-[100px] sm:mb-[160px] scroll-mt-[100px] sm:scroll-mt-[120px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[#A020F0] font-semibold uppercase" style={{ fontSize: 10, letterSpacing: '0.2em' }}>Mint Architecture</span>
          </div>
          <h3 className="font-bold italic uppercase leading-none mb-8 sm:mb-12" style={{ fontSize: 'clamp(32px, 6vw, 64px)', letterSpacing: '-0.02em' }}>
            EARN YOUR<br /><span className="text-[#A020F0]">SPOT_</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 sm:mb-8">
            {/* GawkLord */}
            <div className="bg-gradient-to-br from-[#A020F0]/[0.08] to-[#A020F0]/[0.02] border border-[#A020F0]/20 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#A020F0] text-black font-mono font-bold uppercase"
                style={{ fontSize: 9, padding: '6px 16px', letterSpacing: '0.15em' }}>Free Mint</div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-[#A020F0]/15 flex items-center justify-center shrink-0"><Swords size={20} className="text-[#A020F0]" /></div>
                <h4 className="text-xl sm:text-2xl font-bold italic uppercase">GawkLord</h4>
              </div>
              <p className="text-zinc-500 text-[13px] leading-relaxed mb-5 font-medium">
                Reserved for the Top 300 elite gamers who conquer Level 3 of Gauntlet.
              </p>
              <div className="font-mono text-[#A020F0] flex items-center gap-1.5" style={{ fontSize: 9, letterSpacing: '0.1em' }}>
                <span className="w-1.5 h-1.5 bg-[#A020F0] rounded-full pulse-ring shrink-0" />
                TOP 300 ONLY — SKILL IS THE ONLY CURRENCY
              </div>
            </div>

            {/* GawkList */}
            <div className="bg-white/[0.02] border border-white/[0.06] p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-zinc-800 text-zinc-400 font-mono font-bold uppercase"
                style={{ fontSize: 9, padding: '6px 16px', letterSpacing: '0.15em' }}>Paid Mint</div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-white/[0.04] flex items-center justify-center shrink-0"><Shield size={20} className="text-zinc-600" /></div>
                <h4 className="text-xl sm:text-2xl font-bold italic uppercase">GawkList</h4>
              </div>
              <p className="text-zinc-500 text-[13px] leading-relaxed mb-5 font-medium">
                Community legends, collab winners, and quest participants. These spots are earned through loyalty and engagement.
              </p>
              <div className="font-mono text-zinc-400" style={{ fontSize: 10, letterSpacing: '0.1em' }}>
                EARNED THROUGH LOYALTY &amp; ENGAGEMENT
              </div>
            </div>
          </div>

          {/* Stats — 2 cols on mobile, 4 on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 bg-white/[0.02]">
            {[
              { label: 'Supply', value: '1,111', accent: false },
              { label: 'Chain', value: 'ETH', accent: true },
              { label: 'Price', value: 'TBA', accent: false },
              { label: 'Platform', value: 'OpenSea', accent: false },
            ].map((stat, i) => (
              <div key={i} className="p-5 sm:p-7 bg-[#0a0a0a] text-center" style={{ borderBottom: `2px solid ${stat.accent ? '#A020F0' : '#18181b'}` }}>
                <div className="font-mono text-zinc-600 uppercase mb-2" style={{ fontSize: 9, letterSpacing: '0.2em' }}>{stat.label}</div>
                <div className="font-bold italic" style={{ fontSize: 'clamp(20px, 4vw, 28px)', color: stat.accent ? '#A020F0' : '#fff' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── ECOSYSTEM ─── */}
        <section id="ecosystem" className="mb-[100px] sm:mb-[160px] scroll-mt-[100px] sm:scroll-mt-[120px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[#A020F0] font-semibold uppercase" style={{ fontSize: 10, letterSpacing: '0.2em' }}>The Pipeline</span>
          </div>
          <h3 className="font-bold italic uppercase leading-none mb-4" style={{ fontSize: 'clamp(32px, 6vw, 64px)', letterSpacing: '-0.02em' }}>
            GAME FIRST<br /><span className="text-[#A020F0]">ECOSYSTEM_</span>
          </h3>
          <p className="text-zinc-600 text-sm max-w-[500px] leading-relaxed mb-10 sm:mb-14 font-medium">
            Gawkers isn&apos;t a PFP project. It&apos;s an evolving gaming ecosystem where your NFT is your access key to every title we ship.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5">
            {[
              { step: '01', title: 'Play Gauntlet', desc: 'Our flagship pixel game. Prove your skill across 3 levels of escalating difficulty. Top 300 earn a free mint.', icon: <Gamepad2 size={24} />, status: 'LIVE' },
              { step: '02', title: 'Mint a Gawker', desc: '1,111 unique pixel-art NFTs on ETH. Your key to the entire Gawkers ecosystem and every future title.', icon: <Zap size={24} />, status: 'COMING' },
              { step: '03', title: 'Unlock the Vault', desc: 'Holders get exclusive access to new game modes, tournaments, leaderboard rewards, and community governance.', icon: <Shield size={24} />, status: 'BUILDING' },
              { step: '04', title: 'Expand the Arena', desc: 'New titles drop into the ecosystem. Each game, same NFT. Your Gawker evolves with every release.', icon: <Swords size={24} />, status: 'SOON' },
            ].map((item, i) => (
              <div key={i} className="bg-[#0a0a0a] p-6 sm:p-8 border-t-2 border-zinc-900 hover:border-[#A020F0] hover:bg-[#A020F0]/[0.03] transition-all min-h-0 sm:min-h-[260px] flex flex-col">
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-zinc-900 leading-none">{item.step}</span>
                  <span className="font-mono font-bold border" style={{
                    fontSize: 9, letterSpacing: '0.15em', padding: '4px 10px',
                    background: item.status === 'LIVE' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                    color: item.status === 'LIVE' ? 'rgb(74,222,128)' : '#52525b',
                    borderColor: item.status === 'LIVE' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                  }}>{item.status}</span>
                </div>
                <div className="text-[#A020F0] mb-3 sm:mb-4">{item.icon}</div>
                <h4 className="text-base sm:text-lg font-bold uppercase italic mb-2">{item.title}</h4>
                <p className="text-zinc-600 text-xs leading-relaxed font-medium flex-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA BANNER ─── */}
        <section className="mb-[80px] sm:mb-[120px] p-8 sm:p-16 bg-gradient-to-br from-[#A020F0]/10 to-[#A020F0]/[0.02] border border-[#A020F0]/15 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(to right, rgba(160,32,240,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(160,32,240,0.05) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
          <h3 className="font-bold italic uppercase mb-3 sm:mb-4 relative leading-tight" style={{ fontSize: 'clamp(24px, 5vw, 52px)' }}>
            READY TO<br /><span className="text-[#A020F0]">PROVE YOURSELF?</span>
          </h3>
          <p className="text-zinc-600 text-xs sm:text-sm mb-6 sm:mb-8 relative font-medium">
            Gauntlet is live. The leaderboard is waiting. Skill is the only thing that matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative">
            <a href="https://gauntlet.gawkers.fun" target="_blank" rel="noopener noreferrer"
              className="pixel-border bg-[#A020F0] text-black font-bold text-sm uppercase no-underline hover:bg-white transition-all inline-flex items-center justify-center gap-2"
              style={{ padding: '16px 32px', letterSpacing: '0.05em' }}>
              <Gamepad2 size={16} /> Launch Gauntlet
            </a>
            <a href="https://x.com/gawksoneth" target="_blank" rel="noopener noreferrer"
              className="border border-white/10 text-white font-bold text-sm uppercase no-underline hover:border-[#A020F0] transition-all inline-flex items-center justify-center gap-2"
              style={{ padding: '16px 32px' }}>
              Follow @gawksoneth
            </a>
          </div>
        </section>

      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.04] px-5 sm:px-8 py-8 sm:py-10">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-800 uppercase" style={{ fontSize: 10, letterSpacing: '0.2em' }}>GAWKERS</span>
          </div>
          <div className="flex gap-6">
            <a href="https://x.com/gawksoneth" target="_blank" rel="noopener noreferrer"
              className="font-mono text-gray-300 no-underline hover:text-[#A020F0] transition-colors" style={{ fontSize: 10, letterSpacing: '0.1em' }}>Twitter/𝕏</a>
            <a href="https://gauntlet.gawkers.fun" target="_blank" rel="noopener noreferrer"
              className="font-mono text-gray-300 no-underline hover:text-[#A020F0] transition-colors" style={{ fontSize: 10, letterSpacing: '0.1em' }}>Gauntlet</a>
          </div>
        </div>
      </footer>
    </div>
  );
}