import { useEffect, useState } from "react";
import { Link } from "react-router";

import "./WelcomePage.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://sumquiz.onrender.com"
).replace(/\/$/, "");

function WelcomePage() {
  const [serverStatus, setServerStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 65000);

    fetch(`${API_BASE_URL}/health`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("health check failed");
        setServerStatus("ready");
      })
      .catch(() => setServerStatus("slow"))
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const statusText = {
    checking: "서버를 준비하고 있습니다. 잠시만 기다려 주세요.",
    ready: "서버가 준비되었습니다. 바로 시작할 수 있어요!",
    slow: "서버 준비가 지연되고 있습니다. 로그인 화면에서 잠시 기다려 주세요.",
  }[serverStatus];

  return (
    <div className="welcome-page">
      <header className="welcome-page__header">
        <img src="/images/hwv-logo-cutout.png" alt="HWV" />
      </header>

      <main className="welcome-page__main">
        <section className="welcome-page__hero">
          <p className="welcome-page__eyebrow">HELP WITH VISION · HWV</p>
          <h1>
            내 Java 코드에서 시작하는
            <br />
            <span>AI 맞춤형 코딩 학습</span>
          </h1>
          <p className="welcome-page__description">
            업로드한 Java 파일에서 실제 사용된 핵심 문법을 분석하고,
            나에게 맞는 코딩 문제와 학습 기록을 만들어 드립니다.
          </p>

          <div className="welcome-page__features">
            <article><b>01</b><div><strong>코드 분석</strong><p>Java 코드의 핵심 문법 3개를 찾아요.</p></div></article>
            <article><b>02</b><div><strong>맞춤 문제</strong><p>문법별 코딩 문제를 자동으로 생성해요.</p></div></article>
            <article><b>03</b><div><strong>학습 기록</strong><p>실행 결과와 오답을 한곳에서 관리해요.</p></div></article>
          </div>
        </section>

        <aside className="welcome-page__notice">
          <span className="welcome-page__notice-icon">☕</span>
          <p className="welcome-page__notice-label">시연 전 안내</p>
          <h2>서버가 일어나는 동안<br />HWV를 소개해 드릴게요.</h2>
          <p className="welcome-page__notice-copy">
            HWV는 현재 무료 시연용 서버를 사용하고 있습니다. 오랫동안 접속이 없었던 경우
            서버가 절전 상태에서 깨어나는 데 최대 1분 정도 걸릴 수 있습니다.
          </p>

          <div className={`welcome-page__status welcome-page__status--${serverStatus}`}>
            <i />
            <span>{statusText}</span>
          </div>

          <Link className="welcome-page__start" to="/login">HWV 시작하기</Link>
          <small>버튼을 누른 뒤 첫 로그인 응답이 늦어도 잠시만 기다려 주세요.</small>
        </aside>
      </main>
    </div>
  );
}

export default WelcomePage;
