import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { BarChart3, Code2, Sparkles } from "lucide-react";

import LanguageSelector from "../components/common/LanguageSelector";
import { useLanguage } from "../i18n/LanguageContext";
import "./WelcomePage.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://sumquiz.onrender.com").replace(/\/$/, "");

const copy = {
  ko: {
    title1: "Java 코드 한 파일로", accent: "AI 맞춤형 학습을", title3: "시작하세요.",
    description: "HWV는 Java 코드를 분석하여 핵심 문법을 이해하고, 개인 맞춤형 코딩 문제와 학습 콘텐츠를 제공합니다.",
    features: [["Java 코드 분석", "업로드한 Java 코드를 분석하여 핵심 문법을 자동 추출합니다."], ["AI 문제 생성", "학습 수준에 맞는 코딩 문제를 자동 생성합니다."], ["학습 기록 관리", "풀이 결과와 성장 과정을 한눈에 확인할 수 있습니다."]],
    ready: "준비 완료", preparing: "준비 중...", serverReady: "서버 준비 완료", preparingServer: "서버를 준비하고 있습니다...", login: "로그인 시작하기", notice: "무료 서버는 첫 연결에 최대 1분 정도 걸릴 수 있습니다.",
  },
  en: {
    title1: "Turn one Java file into", accent: "personalized AI learning", title3: "made for you.",
    description: "HWV analyzes your Java code, identifies its core syntax, and provides personalized coding problems and learning content.",
    features: [["Java Code Analysis", "Analyze uploaded Java code and automatically extract its core syntax."], ["AI Problem Generation", "Automatically create coding problems suited to your learning level."], ["Learning History", "Review your solutions and progress at a glance."]],
    ready: "Ready", preparing: "Preparing...", serverReady: "Server ready", preparingServer: "Preparing server...", login: "Start login", notice: "The free server may take up to a minute for the first connection.",
  },
  ja: {
    title1: "Javaコード1ファイルから", accent: "AIパーソナライズ学習を", title3: "始めましょう。",
    description: "HWVはJavaコードを分析して重要な文法を把握し、一人ひとりに合ったコーディング問題と学習コンテンツを提供します。",
    features: [["Javaコード分析", "アップロードしたJavaコードを分析し、重要な文法を自動抽出します。"], ["AI問題生成", "学習レベルに合ったコーディング問題を自動生成します。"], ["学習記録管理", "解答結果と成長の過程をひと目で確認できます。"]],
    ready: "準備完了", preparing: "準備中...", serverReady: "サーバー準備完了", preparingServer: "サーバーを準備しています...", login: "ログインを始める", notice: "無料サーバーの初回接続には最大1分ほどかかる場合があります。",
  },
};

const icons = [Code2, Sparkles, BarChart3];

function WelcomePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = copy[language] || copy.ko;
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(30);
  const requestController = useRef(null);

  useEffect(() => {
    let active = true;
    const progressTimer = window.setInterval(() => setProgress((current) => current < 70 ? Math.min(70, current + 5) : current), 700);
    const delay = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

    async function waitForServer() {
      while (active) {
        const controller = new AbortController();
        requestController.current = controller;
        const timeoutId = window.setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch(`${API_BASE_URL}/health`, { cache: "no-store", signal: controller.signal });
          if (response.ok && active) {
            setProgress(100); setIsReady(true); window.clearInterval(progressTimer); return;
          }
        } catch { /* Render가 깨어나는 동안 다시 확인합니다. */ }
        finally { window.clearTimeout(timeoutId); }
        await delay(2500);
      }
    }
    waitForServer();
    return () => { active = false; window.clearInterval(progressTimer); requestController.current?.abort(); };
  }, []);

  return <div className="introduction-page">
    <div style={{ position: "fixed", top: 24, right: 28, zIndex: 20 }}><LanguageSelector /></div>
    <main className="introduction-page__layout">
      <section className="introduction-page__content">
        <header className="introduction-page__header"><img src="/images/hwv-logo-cutout.png" alt="HWV" /></header>
        <div className="introduction-page__hero">
          <p className="introduction-page__eyebrow">HELP WITH VISION</p>
          <h1>{text.title1}<br /><span>{text.accent}</span><br />{text.title3}</h1>
          <p className="introduction-page__description">{text.description}</p>
        </div>
        <div className="introduction-page__cards">
          {text.features.map(([title, description], index) => {
            const Icon = icons[index];
            return <article className="introduction-page__card" style={{ "--card-delay": `${index * 0.1 + 0.2}s` }} key={title}>
              <span><Icon aria-hidden="true" size={22} strokeWidth={1.8} /></span><h2>{title}</h2><p>{description}</p>
            </article>;
          })}
        </div>
      </section>
      <aside className="introduction-page__visual" aria-label="Server status">
        <img className="introduction-page__large-logo" src="/images/hwv-logo-cutout.png" alt="" />
        <div className="introduction-page__server"><p className={isReady ? "is-ready" : "is-preparing"}><i />Server Status</p><strong>{isReady ? text.ready : text.preparing}</strong></div>
        <div className="introduction-page__progress-area">
          <div className="introduction-page__progress-label"><span>{isReady ? text.serverReady : text.preparingServer}</span><b>{progress}%</b></div>
          <div className="introduction-page__progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
        </div>
        <button className="introduction-page__button" type="button" disabled={!isReady} onClick={() => navigate("/login")}>{isReady ? text.login : text.preparing}</button>
        <p className="introduction-page__notice">{text.notice}</p>
      </aside>
    </main>
  </div>;
}

export default WelcomePage;
