import LoginForm from "../components/login/LoginForm";

import "./LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page">
      <main className="login-page__main">
        <section className="login-page__introduction">
          <div className="login-page__brand"><span>♣</span> HWV</div>

          <p className="login-page__description">
            Java 코드 한 파일로 시작하는<br />
            나만의 맞춤 학습
          </p>

          <div className="login-page__illustration">
            <div className="login-page__laptop"><span>&lt;/&gt;</span></div>
            <div className="login-page__books"><i /><i /><i /></div>
            <div className="login-page__mug" />
            <span className="login-page__sparkle login-page__sparkle--one">✦</span>
            <span className="login-page__sparkle login-page__sparkle--two">✦</span>
          </div>
        </section>

        <section className="login-page__form-area">
          <LoginForm />
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
