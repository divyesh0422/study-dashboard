// src/app/page.tsx
"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen, BarChart2, Brain, Layers, CheckSquare,
  Timer, TrendingUp, Bell, Users, Settings,
  ChevronDown, Search, ArrowRight, Star,
  Activity, Zap, Target,
} from "lucide-react";

/* ── Fonts + global styles ─────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg:       #08080f;
    --bg2:      #0f0f1a;
    --bg3:      #14142a;
    --card:     rgba(255,255,255,0.04);
    --border:   rgba(255,255,255,0.08);
    --border2:  rgba(139,92,246,0.25);
    --purple:   #8b5cf6;
    --purple2:  #a78bfa;
    --violet:   #7c3aed;
    --blue:     #3b82f6;
    --glow:     rgba(124,58,237,0.45);
    --text:     #e2e8f0;
    --textdim:  #94a3b8;
    --textmute: #475569;
    --white:    #ffffff;
    --green:    #10b981;
    --amber:    #f59e0b;
    --red:      #ef4444;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  .land {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
  }

  /* ── Trading grid background ── */
  .land::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  /* Fade grid at edges */
  .land::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, var(--bg) 80%),
      radial-gradient(ellipse 60% 40% at 0% 50%, var(--bg) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 100% 50%, var(--bg) 0%, transparent 60%),
      radial-gradient(ellipse 100% 30% at 50% 100%, var(--bg) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }

  /* Ensure content sits above grid */
  .land > * { position: relative; z-index: 2; }

  /* ── Hero glow ── */
  .hero-glow {
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 900px;
    height: 600px;
    background: radial-gradient(ellipse 60% 60% at 50% 30%, rgba(124,58,237,0.35) 0%, rgba(139,92,246,0.15) 40%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .hero-glow-inner {
    position: absolute;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 300px;
    background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(167,139,250,0.2) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── Nav ── */
  .nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48px;
    height: 64px;
    background: rgba(8,8,15,0.7);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none;
  }
  .nav-logo-icon {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, var(--violet), var(--purple2));
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 800; color: #fff;
    font-family: 'Bricolage Grotesque', sans-serif;
    box-shadow: 0 0 20px rgba(124,58,237,0.4);
  }
  .nav-logo-name {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 17px; font-weight: 700; color: var(--white);
    letter-spacing: -0.02em;
  }
  .nav-links { display: flex; gap: 4px; }
  .nav-link {
    font-size: 14px; color: var(--textdim);
    text-decoration: none; padding: 6px 14px;
    border-radius: 6px; transition: all 0.2s;
  }
  .nav-link:hover { color: var(--white); background: var(--card); }
  .nav-link.active { color: var(--white); }
  .nav-right { display: flex; align-items: center; gap: 10px; }
  .btn-login {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    color: var(--textdim); text-decoration: none;
    padding: 8px 18px; border-radius: 8px;
    transition: color 0.2s;
  }
  .btn-login:hover { color: var(--white); }
  .btn-cta {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    color: #fff; text-decoration: none;
    background: linear-gradient(135deg, var(--violet) 0%, var(--purple2) 100%);
    padding: 9px 22px; border-radius: 100px;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.25s;
    box-shadow: 0 0 24px rgba(124,58,237,0.4);
    border: none; cursor: pointer;
  }
  .btn-cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 36px rgba(124,58,237,0.6);
  }
  .btn-cta-outline {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    color: var(--purple2); text-decoration: none;
    background: transparent;
    padding: 9px 22px; border-radius: 100px;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.25s;
    border: 1px solid var(--border2);
    cursor: pointer;
  }
  .btn-cta-outline:hover { background: rgba(139,92,246,0.08); }

  /* ── Hero ── */
  .hero {
    position: relative;
    padding: 160px 48px 80px;
    text-align: center;
    overflow: hidden;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(139,92,246,0.12);
    border: 1px solid rgba(139,92,246,0.3);
    border-radius: 100px;
    padding: 6px 16px;
    font-size: 13px; font-weight: 500;
    color: var(--purple2);
    margin-bottom: 28px;
    animation: fade-up 0.6s ease both;
  }
  .hero-badge-dot {
    width: 6px; height: 6px;
    background: var(--purple);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  @keyframes fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .hero-headline {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: var(--white);
    max-width: 820px;
    margin: 0 auto 20px;
    position: relative; z-index: 1;
    animation: fade-up 0.6s 0.1s ease both;
  }
  .hero-headline em {
    font-style: italic;
    background: linear-gradient(135deg, var(--purple2), #c4b5fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub {
    font-size: 17px; font-weight: 400; line-height: 1.65;
    color: var(--textdim);
    max-width: 520px; margin: 0 auto 36px;
    position: relative; z-index: 1;
    animation: fade-up 0.6s 0.2s ease both;
  }
  .hero-ctas {
    display: flex; align-items: center; justify-content: center;
    gap: 12px; margin-bottom: 60px;
    position: relative; z-index: 1;
    animation: fade-up 0.6s 0.3s ease both;
  }
  .hero-trial-btn {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px; font-weight: 600;
    color: #fff; text-decoration: none;
    background: linear-gradient(135deg, var(--violet), var(--purple2));
    padding: 13px 30px; border-radius: 100px;
    display: inline-flex; align-items: center; gap: 8px;
    box-shadow: 0 4px 32px rgba(124,58,237,0.5);
    transition: all 0.25s;
    border: none; cursor: pointer;
  }
  .hero-trial-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 48px rgba(124,58,237,0.65);
  }
  .hero-social-proof {
    display: flex; align-items: center; justify-content: center; gap: 16px;
    font-size: 13px; color: var(--textmute);
    margin-bottom: 56px;
    animation: fade-up 0.6s 0.4s ease both;
    position: relative; z-index: 1;
  }
  .stars { color: var(--amber); letter-spacing: 1px; }
  .proof-sep { width: 4px; height: 4px; background: var(--textmute); border-radius: 50%; }

  /* ── Dashboard mockup ── */
  .mockup-wrapper {
    position: relative; z-index: 1;
    max-width: 1100px; margin: 0 auto;
    animation: fade-up 0.8s 0.5s ease both;
  }
  .mockup-glow {
    position: absolute;
    bottom: -40px; left: 50%;
    transform: translateX(-50%);
    width: 80%; height: 120px;
    background: radial-gradient(ellipse, rgba(124,58,237,0.35) 0%, transparent 70%);
    filter: blur(30px);
    pointer-events: none;
  }
  .mockup {
    background: var(--bg2);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(139,92,246,0.15),
      0 40px 80px rgba(0,0,0,0.6),
      0 0 60px rgba(124,58,237,0.15);
  }
  .mockup-bar {
    background: var(--bg3);
    padding: 12px 20px;
    display: flex; align-items: center; gap: 8px;
    border-bottom: 1px solid var(--border);
  }
  .m-dot { width: 10px; height: 10px; border-radius: 50%; }
  .mockup-title {
    margin-left: 8px;
    font-size: 13px; color: var(--textdim);
    font-weight: 500;
  }
  .mockup-body {
    display: grid;
    grid-template-columns: 220px 1fr;
    min-height: 380px;
  }

  /* Sidebar */
  .m-sidebar {
    background: rgba(0,0,0,0.25);
    border-right: 1px solid var(--border);
    padding: 16px 0;
  }
  .m-sidebar-logo {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 16px 16px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 12px;
  }
  .m-sidebar-icon {
    width: 28px; height: 28px;
    background: linear-gradient(135deg, var(--violet), var(--purple2));
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; color: #fff;
    font-family: 'Bricolage Grotesque', sans-serif;
  }
  .m-sidebar-name {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 14px; font-weight: 700; color: var(--white);
  }
  .m-search {
    display: flex; align-items: center; gap: 6px;
    margin: 0 12px 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 11px; color: var(--textmute);
  }
  .m-nav-item {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 16px;
    font-size: 12px; color: var(--textdim);
    cursor: pointer; transition: all 0.15s;
    border-left: 2px solid transparent;
  }
  .m-nav-item:hover { color: var(--text); background: rgba(255,255,255,0.03); }
  .m-nav-item.active {
    color: var(--white); background: rgba(139,92,246,0.12);
    border-left-color: var(--purple);
  }
  .m-nav-sub {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 16px 5px 36px;
    font-size: 11px; color: var(--textmute);
    cursor: pointer; transition: color 0.15s;
  }
  .m-nav-sub:hover { color: var(--textdim); }

  /* Main content */
  .m-main { padding: 20px 24px; overflow: hidden; }
  .m-welcome {
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .m-welcome-name {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 18px; font-weight: 700; color: var(--white);
  }
  .m-welcome-sub { font-size: 12px; color: var(--textmute); margin-top: 2px; }
  .m-welcome-icons { display: flex; gap: 8px; }
  .m-icon-btn {
    width: 28px; height: 28px;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 6px; display: flex; align-items: center; justify-content: center;
    color: var(--textdim); cursor: pointer;
  }

  .m-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .m-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
  }
  .m-card-title {
    font-size: 11px; font-weight: 600; color: var(--textdim);
    text-transform: uppercase; letter-spacing: 0.05em;
    margin-bottom: 12px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .m-card-dots { color: var(--textmute); font-size: 14px; cursor: pointer; }

  /* Stats row */
  .m-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 12px; }
  .m-stat { text-align: center; }
  .m-stat-num { font-family: 'Bricolage Grotesque',sans-serif; font-size: 26px; font-weight: 700; color: var(--white); line-height: 1; }
  .m-stat-label { font-size: 10px; color: var(--textmute); margin-top: 3px; }
  .m-stat-tag {
    font-size: 10px; padding: 2px 7px; border-radius: 100px;
    display: inline-block; margin-top: 3px;
  }
  .tag-red { background: rgba(239,68,68,0.15); color: var(--red); }
  .tag-grn { background: rgba(16,185,129,0.15); color: var(--green); }
  .tag-blu { background: rgba(59,130,246,0.15); color: var(--blue); }

  /* Mini bar chart */
  .m-barchart {
    display: flex; align-items: flex-end; gap: 3px;
    height: 64px;
    margin-top: 10px;
  }
  .m-bar {
    flex: 1; border-radius: 3px 3px 0 0;
    background: linear-gradient(180deg, var(--purple) 0%, rgba(139,92,246,0.3) 100%);
    transition: opacity 0.2s;
    position: relative;
  }
  .m-bar.hi { background: linear-gradient(180deg, var(--purple2) 0%, rgba(167,139,250,0.4) 100%); }
  .m-bar-labels {
    display: flex; justify-content: space-between;
    margin-top: 5px;
  }
  .m-bar-label { font-size: 9px; color: var(--textmute); }

  /* Recent activity */
  .m-activity { margin-top: 12px; }
  .m-act-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
    font-size: 11px;
  }
  .m-act-item:last-child { border-bottom: none; }
  .m-act-avatar {
    width: 28px; height: 28px; border-radius: 7px;
    flex-shrink: 0; display: flex; align-items: center;
    justify-content: center; font-size: 10px; font-weight: 700;
  }
  .m-act-content { flex: 1; min-width: 0; }
  .m-act-title { color: var(--text); font-weight: 500; }
  .m-act-sub { color: var(--textmute); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .m-act-time { color: var(--textmute); font-size: 10px; flex-shrink: 0; }

  /* ── Features section ── */
  .features {
    padding: 100px 48px;
    max-width: 1200px; margin: 0 auto;
  }
  .section-label {
    font-size: 13px; font-weight: 600; letter-spacing: 0.08em;
    color: var(--purple2); text-transform: uppercase;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-label::before {
    content: ''; display: block;
    width: 20px; height: 2px;
    background: var(--purple2);
    border-radius: 2px;
  }
  .section-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: clamp(30px, 4vw, 48px);
    font-weight: 800; line-height: 1.1;
    letter-spacing: -0.02em; color: var(--white);
    max-width: 600px; margin-bottom: 16px;
  }
  .section-sub {
    font-size: 16px; color: var(--textdim);
    max-width: 500px; line-height: 1.65;
    margin-bottom: 56px;
  }

  .feat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .feat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
    transition: all 0.3s;
    position: relative; overflow: hidden;
  }
  .feat-card:hover {
    border-color: rgba(139,92,246,0.3);
    background: rgba(139,92,246,0.06);
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  }
  .feat-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--purple), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .feat-card:hover::before { opacity: 1; }
  .feat-icon-wrap {
    width: 48px; height: 48px;
    background: linear-gradient(135deg, rgba(124,58,237,0.25), rgba(139,92,246,0.1));
    border: 1px solid rgba(139,92,246,0.25);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px;
  }
  .feat-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 17px; font-weight: 700; color: var(--white);
    margin-bottom: 8px; letter-spacing: -0.01em;
  }
  .feat-desc { font-size: 13px; color: var(--textdim); line-height: 1.65; }

  /* ── Stats section ── */
  .stats-section {
    padding: 0 48px 100px;
    max-width: 1200px; margin: 0 auto;
  }
  .stats-band {
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(59,130,246,0.06) 100%);
    border: 1px solid rgba(139,92,246,0.2);
    border-radius: 20px; padding: 48px;
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 32px;
  }
  .stat-item { text-align: center; }
  .stat-num {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 44px; font-weight: 800;
    line-height: 1;
    background: linear-gradient(135deg, var(--white), var(--purple2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.03em;
  }
  .stat-label-lg { font-size: 14px; color: var(--textdim); margin-top: 8px; }

  /* ── Testimonials ── */
  .testi-section {
    padding: 0 48px 100px;
    max-width: 1200px; margin: 0 auto;
  }
  .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .testi-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
    transition: all 0.25s;
  }
  .testi-card:hover { border-color: rgba(139,92,246,0.25); transform: translateY(-2px); }
  .testi-stars { color: var(--amber); font-size: 13px; letter-spacing: 2px; margin-bottom: 14px; }
  .testi-text { font-size: 14px; line-height: 1.7; color: var(--text); margin-bottom: 20px; }
  .testi-author { display: flex; align-items: center; gap: 12px; }
  .testi-av {
    width: 38px; height: 38px; border-radius: 10px;
    font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .testi-name { font-size: 13px; font-weight: 600; color: var(--white); }
  .testi-role { font-size: 12px; color: var(--textmute); }

  /* ── CTA bottom ── */
  .cta-section {
    padding: 0 48px 100px;
    max-width: 1200px; margin: 0 auto;
    text-align: center;
  }
  .cta-card {
    background: linear-gradient(135deg, var(--bg3) 0%, rgba(124,58,237,0.15) 100%);
    border: 1px solid rgba(139,92,246,0.25);
    border-radius: 24px; padding: 72px 48px;
    position: relative; overflow: hidden;
  }
  .cta-card::before {
    content: '';
    position: absolute;
    top: -100px; left: 50%; transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: clamp(28px, 4vw, 48px);
    font-weight: 800; line-height: 1.1;
    letter-spacing: -0.02em; color: var(--white);
    margin-bottom: 16px;
    position: relative; z-index: 1;
  }
  .cta-sub {
    font-size: 16px; color: var(--textdim); line-height: 1.65;
    max-width: 440px; margin: 0 auto 36px;
    position: relative; z-index: 1;
  }
  .cta-btns {
    display: flex; align-items: center; justify-content: center;
    gap: 12px; position: relative; z-index: 1;
  }

  /* ── Footer ── */
  .footer {
    border-top: 1px solid var(--border);
    padding: 40px 48px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .footer-logo {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 15px; font-weight: 700; color: var(--white);
    display: flex; align-items: center; gap: 8px; text-decoration: none;
  }
  .footer-links { display: flex; gap: 24px; }
  .footer-link { font-size: 13px; color: var(--textmute); text-decoration: none; transition: color 0.2s; }
  .footer-link:hover { color: var(--text); }
  .footer-copy { font-size: 13px; color: var(--textmute); }

  @media(max-width:1024px) {
    .feat-grid { grid-template-columns: repeat(2,1fr); }
    .stats-band { grid-template-columns: repeat(2,1fr); }
    .testi-grid { grid-template-columns: 1fr; }
    .mockup-body { grid-template-columns: 160px 1fr; }
  }
  @media(max-width:768px) {
    .nav { padding: 0 20px; }
    .nav-links { display: none; }
    .hero { padding: 120px 20px 60px; }
    .features,.stats-section,.testi-section,.cta-section { padding-left: 20px; padding-right: 20px; }
    .feat-grid { grid-template-columns: 1fr; }
    .stats-band { grid-template-columns: repeat(2,1fr); padding: 32px 24px; }
    .footer { flex-direction: column; gap: 20px; text-align: center; }
    .footer-links { flex-wrap: wrap; justify-content: center; }
    .mockup { display: none; }
  }
`;

/* Animated number */
function AnimNum({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let s = 0;
      const step = to / 60;
      const t = setInterval(() => {
        s += step;
        if (s >= to) { setV(to); clearInterval(t); }
        else setV(Math.floor(s));
      }, 16);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
}

/* Mini bar chart heights */
const BARS = [28,42,35,56,48,64,52,72,60,44,68,76];
const MONTHS = ["A","S","O","N","D","J","F","M","A","M","J","A"];

const FEATURES = [
  { icon: <Timer size={22} color="#a78bfa"/>, title: "Pomodoro Timer", desc: "25/5/15 focus cycles with automatic session logging. Every second tracked and synced to your analytics dashboard." },
  { icon: <Brain size={22} color="#a78bfa"/>, title: "AI Study Guide", desc: "Claude-powered assistant for study plans, concept breakdowns, quiz generation, and essay feedback — always one click away." },
  { icon: <BarChart2 size={22} color="#a78bfa"/>, title: "Analytics", desc: "30-day deep dives with weekly hours, subject breakdowns, streak tracking, and completion rate benchmarks." },
  { icon: <Layers size={22} color="#a78bfa"/>, title: "Flashcard Decks", desc: "3D flip cards with Easy / Medium / Hard difficulty ratings. Spaced repetition built directly into the workflow." },
  { icon: <CheckSquare size={22} color="#a78bfa"/>, title: "Task Tracker", desc: "Priority-based tasks with due dates, status columns, and per-subject filtering. Never miss a deadline again." },
  { icon: <BookOpen size={22} color="#a78bfa"/>, title: "Smart Notes", desc: "Rich text notes linked to subjects. Full-text search and tagging so the right material is always findable." },
];

export default function LandingPage() {
  return (
    <div className="land">
      <style>{STYLE}</style>

      {/* ── Nav ── */}
      <nav className="nav">
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">S</div>
          <span className="nav-logo-name">StudyDash</span>
        </Link>
        <div className="nav-links">
          <a href="#features" className="nav-link active">Home</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#stats"    className="nav-link">Pricing</a>
        </div>
        <div className="nav-right">
          <Link href="/login"    className="btn-login">Login</Link>
          <Link href="/register" className="btn-cta">Open Account</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-glow"><div className="hero-glow-inner"/></div>

        <div className="hero-badge">
          <span className="hero-badge-dot"/>
          New — AI Study Guide powered by Claude
        </div>

        <h1 className="hero-headline">
          Elevate Your <em>Study</em><br/>
          Performance with StudyDash
        </h1>

        <p className="hero-sub">
          Streamline, optimise, and scale your academic performance with our powerful
          all-in-one student productivity platform.
        </p>

        <div className="hero-ctas">
          <Link href="/register" className="hero-trial-btn">
            14 days free trial
          </Link>
          <a href="#features" className="btn-cta-outline">
            See features <ArrowRight size={14}/>
          </a>
        </div>

        <div className="hero-social-proof">
          <div className="stars">★★★★★</div>
          <div className="proof-sep"/>
          <span>Rated 4.9/5 by 1,200+ students</span>
          <div className="proof-sep"/>
          <span>No credit card required</span>
        </div>

        {/* Dashboard mockup */}
        <div className="mockup-wrapper">
          <div className="mockup-glow"/>
          <div className="mockup">
            {/* Title bar */}
            <div className="mockup-bar">
              <div className="m-dot" style={{background:"#ff5f57"}}/>
              <div className="m-dot" style={{background:"#febc2e"}}/>
              <div className="m-dot" style={{background:"#28c840"}}/>
              <span className="mockup-title">StudyDash — Dashboard</span>
            </div>

            <div className="mockup-body">
              {/* Sidebar */}
              <div className="m-sidebar">
                <div className="m-sidebar-logo">
                  <div className="m-sidebar-icon">S</div>
                  <span className="m-sidebar-name">StudyDash</span>
                </div>
                <div className="m-search">
                  <Search size={10} color="#475569"/>
                  <span>Search...</span>
                </div>
                {[
                  { icon: <Activity size={13}/>, label: "Dashboard",  active: true },
                  { icon: <BookOpen size={13}/>, label: "Subjects",   active: false },
                  { icon: <CheckSquare size={13}/>, label: "Tasks",   active: false },
                  { icon: <BookOpen size={13}/>, label: "Notes",      active: false },
                  { icon: <Timer size={13}/>,    label: "Timer",      active: false },
                  { icon: <BarChart2 size={13}/>, label: "Analytics", active: false },
                  { icon: <Layers size={13}/>,   label: "Tools",      active: false },
                  { icon: <Brain size={13}/>,    label: "AI Guide",   active: false },
                ].map((item) => (
                  <div key={item.label} className={`m-nav-item${item.active ? " active" : ""}`}>
                    {item.icon}
                    <span>{item.label}</span>
                    {!item.active && <ChevronDown size={10} style={{marginLeft:"auto",opacity:0.4}}/>}
                  </div>
                ))}
                <div style={{marginTop:8, borderTop:"1px solid var(--border)", paddingTop:8}}>
                  <div className="m-nav-item"><Users size={13}/><span>Contacts</span></div>
                  <div className="m-nav-item"><Settings size={13}/><span>Settings</span></div>
                </div>
              </div>

              {/* Main */}
              <div className="m-main">
                <div className="m-welcome">
                  <div>
                    <div className="m-welcome-name">Welcome back, Alex Smith</div>
                    <div className="m-welcome-sub">Study hard, stay consistent, achieve your goals.</div>
                  </div>
                  <div className="m-welcome-icons">
                    <div className="m-icon-btn"><Bell size={12}/></div>
                    <div className="m-icon-btn"><Settings size={12}/></div>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {/* Overview card */}
                  <div className="m-card">
                    <div className="m-card-title">Overview <span className="m-card-dots">···</span></div>
                    <div className="m-stats">
                      <div className="m-stat">
                        <div className="m-stat-num">5</div>
                        <div className="m-stat-label">Due Soon</div>
                        <div className="m-stat-tag tag-red">Tasks</div>
                      </div>
                      <div className="m-stat">
                        <div className="m-stat-num">9</div>
                        <div className="m-stat-label">Overdue</div>
                        <div className="m-stat-tag tag-red">!</div>
                      </div>
                      <div className="m-stat">
                        <div className="m-stat-num">14</div>
                        <div className="m-stat-label">Streak</div>
                        <div className="m-stat-tag tag-grn">days</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:10}}>
                      {[{n:"206",l:"Subjects Active",c:"tag-grn"},{n:"13",l:"Inactive",c:"tag-red"},{n:"06",l:"In Progress",c:"tag-blu"}].map(s=>(
                        <div key={s.l} style={{background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:7,padding:"8px 6px",textAlign:"center"}}>
                          <div style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:18,fontWeight:700,color:"var(--white)"}}>{s.n}</div>
                          <div style={{fontSize:9,color:"var(--textmute)",marginTop:2,lineHeight:1.3}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart card */}
                  <div className="m-card">
                    <div className="m-card-title" style={{marginBottom:4}}>
                      Study Hours
                      <span style={{fontSize:10,background:"rgba(16,185,129,0.15)",color:"var(--green)",padding:"1px 7px",borderRadius:100}}>↑ 18%</span>
                    </div>
                    <div className="m-barchart">
                      {BARS.map((h, i) => (
                        <div key={i} className={`m-bar${i===7||i===11?" hi":""}`} style={{height:`${h}px`,animationDelay:`${i*40}ms`}}/>
                      ))}
                    </div>
                    <div className="m-bar-labels">
                      {MONTHS.map((m,i) => <span key={i} className="m-bar-label">{m}</span>)}
                    </div>
                  </div>
                </div>

                {/* Recent comments */}
                <div className="m-card" style={{marginTop:12}}>
                  <div className="m-card-title">Recent Activity <span className="m-card-dots">···</span></div>
                  <div className="m-activity">
                    {[
                      { av:"AL", c:"#6366f1", name:"Alex logged",  sub:"Completed 2 Pomodoros — Physics Chapter 7", time:"Just now" },
                      { av:"AI", c:"#8b5cf6", name:"AI Guide",     sub:"Generated study plan for upcoming exam", time:"2h ago" },
                      { av:"AL", c:"#6366f1", name:"Task updated", sub:"Problem Set 3 marked as complete", time:"3h ago" },
                    ].map((a,i) => (
                      <div key={i} className="m-act-item">
                        <div className="m-act-avatar" style={{background:a.c+"30",color:a.c}}>{a.av}</div>
                        <div className="m-act-content">
                          <div className="m-act-title">{a.name}</div>
                          <div className="m-act-sub">{a.sub}</div>
                        </div>
                        <div className="m-act-time">{a.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features" id="features">
        <div className="section-label">Core Features</div>
        <h2 className="section-title">Everything you need to<br/>study smarter</h2>
        <p className="section-sub">
          Six deeply integrated tools that work together — from tracking your time
          to mastering your material with AI.
        </p>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feat-card">
              <div className="feat-icon-wrap">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section" id="stats">
        <div className="stats-band">
          {[
            { n: 12000, s: "+",  label: "Active Students",   suf: "" },
            { n: 2400000, s: "", label: "Study Hours Logged", suf: "+" },
            { n: 47,   s: "",   label: "Avg Session (min)",  suf: ""  },
            { n: 91,   s: "",   label: "Completion Rate %",  suf: "%" },
          ].map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-num">
                {s.s}<AnimNum to={s.n} suffix={s.suf}/>
              </div>
              <div className="stat-label-lg">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testi-section">
        <div style={{textAlign:"center",marginBottom:48}}>
          <div className="section-label" style={{justifyContent:"center"}}>Testimonials</div>
          <h2 className="section-title" style={{margin:"0 auto",textAlign:"center"}}>Loved by students<br/>worldwide</h2>
        </div>
        <div className="testi-grid">
          {[
            { av:"PM", c:"#6366f1", stars:"★★★★★", text:"The Pomodoro timer + analytics combo completely changed how I study. Seeing progress week over week feels like trading a portfolio — incredibly motivating.", name:"Priya M.", role:"Med Student, Year 3" },
            { av:"JK", c:"#ec4899", stars:"★★★★★", text:"I pasted a confusing paragraph from my textbook into the AI Guide and it explained it better than my professor did in 40 minutes of lecture. Genuinely magical.", name:"James K.", role:"CS Undergrad" },
            { av:"SR", c:"#f97316", stars:"★★★★★", text:"Flashcard study mode with difficulty rating is exactly what spaced repetition needed. I went from 62% to 89% on my anatomy midterm using this alone.", name:"Sofia R.", role:"Pre-Med, Year 2" },
          ].map((t) => (
            <div key={t.name} className="testi-card">
              <div className="testi-stars">{t.stars}</div>
              <div className="testi-text">"{t.text}"</div>
              <div className="testi-author">
                <div className="testi-av" style={{background:t.c+"25",color:t.c}}>{t.av}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Ready to elevate your<br/>academic performance?</h2>
          <p className="cta-sub">
            Join 12,000+ students. Start your 14-day free trial.
            No credit card required.
          </p>
          <div className="cta-btns">
            <Link href="/register" className="hero-trial-btn">
              Start Free Trial <ArrowRight size={14}/>
            </Link>
            <Link href="/login" className="btn-cta-outline">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <Link href="/" className="footer-logo">
          <div className="nav-logo-icon" style={{width:26,height:26,fontSize:13}}>S</div>
          StudyDash
        </Link>
        <div className="footer-links">
          <a href="#features" className="footer-link">Features</a>
          <Link href="/register" className="footer-link">Register</Link>
          <Link href="/login"    className="footer-link">Sign In</Link>
          <a href="#stats"    className="footer-link">Pricing</a>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} StudyDash. All rights reserved.</div>
      </footer>
    </div>
  );
}
