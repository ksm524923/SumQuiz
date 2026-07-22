import { Link } from "react-router";
import { FileUp, ListChecks, ScanSearch } from "lucide-react";

import SignupForm from "../components/signup/SignupForm";
import "./SignupPage.css";

function SignupPage() {
  return (
    <div className="signup-page">
      <header className="signup-page__header">
        <Link className="signup-page__logo" to="/login" aria-label="HWV 로그인으로 이동">
          <img src="/images/hwv-logo-cutout.png" alt="HWV" />
        </Link>
      </header>

      <main className="signup-page__main">
        <section className="signup-page__introduction">
          <p className="signup-page__eyebrow">Start Java learning with HWV</p>

          <h1>
            내 Java 코드로 배우는
            <br />
            <span>맞춤형 문법 학습</span>
          </h1>

          <p className="signup-page__description">
            Java 파일을 업로드하면 AI가 코드의 핵심 문법을 분석하고
            <br />
            코드에 맞춘 퀴즈로 학습을 이어갈 수 있어요.
          </p>

          <div className="signup-page__features">
            <div>
              <span className="signup-page__feature-icon">
                <FileUp aria-hidden="true" size={25} strokeWidth={1.8} />
                <b>1</b>
              </span>
              <p><strong>파일 업로드</strong>Java 파일을 간편하게 등록하세요.</p>
            </div>
            <div>
              <span className="signup-page__feature-icon">
                <ScanSearch aria-hidden="true" size={25} strokeWidth={1.8} />
                <b>2</b>
              </span>
              <p><strong>문법 분석</strong>AI가 코드의 핵심 문법을 분석해 드려요.</p>
            </div>
            <div>
              <span className="signup-page__feature-icon">
                <ListChecks aria-hidden="true" size={25} strokeWidth={1.8} />
                <b>3</b>
              </span>
              <p><strong>맞춤 퀴즈</strong>분석 결과를 바탕으로 맞춤 퀴즈를 풀어요.</p>
            </div>
          </div>
        </section>

        <SignupForm />
      </main>

      <footer className="signup-page__footer">
        <div><a href="#terms">이용약관</a><span /> <a href="#privacy">개인정보처리방침</a></div>
        <p>© 2026 HWV. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default SignupPage;
