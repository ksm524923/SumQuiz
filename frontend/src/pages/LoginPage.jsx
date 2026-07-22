import { BarChart3, Check, ChevronLeft, Code2 } from "lucide-react";
import { Link } from "react-router";

import LoginForm from "../components/login/LoginForm";
import "./LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page">
      <main className="login-page__main">
        <section className="login-page__introduction">
          <Link className="login-page__back" to="/" aria-label="프로젝트 소개로 돌아가기"><ChevronLeft /></Link>
          <div className="login-page__copy">
            <img className="login-page__logo" src="/images/hwv-logo-cutout.png" alt="HWV" />
            <p className="login-page__eyebrow">Java Learning Platform</p>
            <h1>코드로 배우는<br />나만의 <strong>Java</strong> 학습</h1>
            <p className="login-page__description">HWV와 함께 더 깊이, 더 꾸준히 성장해요.<br />오늘의 학습이 내일의 실력이 됩니다.</p>
          </div>
          <div className="login-page__visual" aria-hidden="true">
            <div className="login-page__visual-card login-page__visual-card--code"><Code2 /><span /><span /><span /></div>
            <div className="login-page__visual-card login-page__visual-card--progress">
              <div className="login-page__check-row"><Check /><span /></div>
              <div className="login-page__check-row"><Check /><span /></div>
              <div className="login-page__check-row login-page__check-row--empty"><i /><span /></div>
              <div className="login-page__progress-summary"><BarChart3 /><p>학습 진행률 <strong>72%</strong></p></div>
            </div>
          </div>
          <div className="login-page__dots" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
        </section>
        <section className="login-page__form-area"><LoginForm /></section>
      </main>
    </div>
  );
}

export default LoginPage;
