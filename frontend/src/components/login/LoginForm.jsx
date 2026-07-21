import { loginUser } from "../../services/authApi";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import Button from "../common/Button";
import { saveLoginUser } from "../../services/session";
import "./LoginForm.css";

function LoginForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isLoggingIn) {
      return;
    }

    console.log("로그인 버튼 클릭됨");

    if (formData.email.trim() === "") {
      setErrorMessage("이메일을 입력해 주세요.");
      return;
    }

    if (formData.password.trim() === "") {
      setErrorMessage("비밀번호를 입력해 주세요.");
      return;
    }

    setErrorMessage("");
    setIsLoggingIn(true);

    try {
      const result = await loginUser(formData.email, formData.password);

      console.log("로그인 성공", result);

      saveLoginUser(result, formData.email);

      navigate("/home");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.message || "로그인 중 오류가 발생했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <section className="login-form">
      <div className="login-form__heading">
        <span>WELCOME BACK</span>
        <h2>HWV에 오신 걸 환영해요!</h2>

        <p>로그인하고 Java 학습을 이어가세요.</p>
      </div>

      <form onSubmit={handleSubmit} aria-busy={isLoggingIn}>
        <div className="login-form__field">
          <label htmlFor="email">이메일</label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            placeholder="이메일을 입력하세요"
            autoComplete="email"
            onChange={handleInputChange}
            disabled={isLoggingIn}
          />
        </div>

        <div className="login-form__field">
          <label htmlFor="password">비밀번호</label>

          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
            onChange={handleInputChange}
            disabled={isLoggingIn}
          />
        </div>

        {errorMessage && <p className="login-form__error">{errorMessage}</p>}

        <Button type="submit" fullWidth disabled={isLoggingIn}>
          {isLoggingIn ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <p className="login-form__signup">
        아직 계정이 없으신가요?
        <Link to="/signup"> 회원가입</Link>
      </p>
    </section>
  );
}

export default LoginForm;
