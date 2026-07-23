import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signupUser } from "../../services/authApi";
import { rememberRegisteredUser } from "../../services/session";
import { useLanguage } from "../../i18n/LanguageContext";
import Button from "../common/Button";
import "./SignupForm.css";

const copy = {
  ko: { title: "회원가입", intro: "HWV와 함께 코딩 학습을 시작하세요.", name: "이름", email: "이메일", password: "비밀번호", confirm: "비밀번호 확인", namePh: "이름을 입력하세요", emailPh: "이메일을 입력하세요", passwordPh: "비밀번호를 8자 이상 입력하세요", confirmPh: "비밀번호를 다시 입력하세요", terms: "이용약관", privacy: "개인정보처리방침", agree: "에 동의합니다.", submit: "회원가입", submitting: "가입 중...", account: "이미 계정이 있으신가요?", login: "로그인", requiredName: "이름을 입력해 주세요.", requiredEmail: "이메일을 입력해 주세요.", requiredPassword: "비밀번호를 입력해 주세요.", shortPassword: "비밀번호는 8자 이상 입력해 주세요.", mismatch: "비밀번호가 일치하지 않습니다.", requiredTerms: "이용약관 및 개인정보처리방침에 동의해 주세요.", success: "회원가입이 완료되었습니다. 로그인해 주세요.", failure: "회원가입에 실패했습니다." },
  en: { title: "Sign up", intro: "Start learning to code with HWV.", name: "Name", email: "Email", password: "Password", confirm: "Confirm password", namePh: "Enter your name", emailPh: "Enter your email", passwordPh: "Enter at least 8 characters", confirmPh: "Enter your password again", terms: "Terms of Use", privacy: "Privacy Policy", agree: ".", submit: "Sign up", submitting: "Signing up...", account: "Already have an account?", login: "Log in", requiredName: "Please enter your name.", requiredEmail: "Please enter your email.", requiredPassword: "Please enter your password.", shortPassword: "Password must be at least 8 characters.", mismatch: "Passwords do not match.", requiredTerms: "Please agree to the Terms and Privacy Policy.", success: "Your account is ready. Please log in.", failure: "Sign-up failed." },
  ja: { title: "新規登録", intro: "HWVと一緒にコーディング学習を始めましょう。", name: "名前", email: "メールアドレス", password: "パスワード", confirm: "パスワード確認", namePh: "名前を入力してください", emailPh: "メールアドレスを入力してください", passwordPh: "8文字以上で入力してください", confirmPh: "もう一度入力してください", terms: "利用規約", privacy: "プライバシーポリシー", agree: "に同意します。", submit: "登録する", submitting: "登録中...", account: "すでにアカウントをお持ちですか？", login: "ログイン", requiredName: "名前を入力してください。", requiredEmail: "メールアドレスを入力してください。", requiredPassword: "パスワードを入力してください。", shortPassword: "パスワードは8文字以上で入力してください。", mismatch: "パスワードが一致しません。", requiredTerms: "利用規約とプライバシーポリシーに同意してください。", success: "登録が完了しました。ログインしてください。", failure: "登録に失敗しました。" },
};

function SignupForm() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = copy[language] || copy.ko;
  const [formData, setFormData] = useState({ name: "", email: "", password: "", passwordConfirm: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const handleInputChange = ({ target: { name, value } }) => setFormData((previous) => ({ ...previous, [name]: value }));

  async function handleSubmit(event) {
    event.preventDefault();
    const error = !formData.name.trim() ? text.requiredName : !formData.email.trim() ? text.requiredEmail : !formData.password ? text.requiredPassword : formData.password.length < 8 ? text.shortPassword : formData.password !== formData.passwordConfirm ? text.mismatch : !agreedToTerms ? text.requiredTerms : "";
    if (error) { setErrorMessage(error); return; }
    try {
      setErrorMessage(""); setIsSubmitting(true);
      await signupUser({ name: formData.name, email: formData.email, password: formData.password });
      rememberRegisteredUser({ name: formData.name, email: formData.email });
      alert(text.success); navigate("/login");
    } catch (requestError) { setErrorMessage(requestError.message || text.failure); }
    finally { setIsSubmitting(false); }
  }

  return <section className="signup-form">
    <div className="signup-form__heading"><h2>{text.title}</h2><p><strong>HWV</strong>{text.intro.replace("HWV", "")}</p></div>
    <form onSubmit={handleSubmit}>
      {[["name", "text", text.name, text.namePh, "name"], ["email", "email", text.email, text.emailPh, "email"], ["password", "password", text.password, text.passwordPh, "new-password"], ["passwordConfirm", "password", text.confirm, text.confirmPh, "new-password"]].map(([name, type, label, placeholder, autoComplete]) => <div className="signup-form__field" key={name}><label htmlFor={`signup-${name}`}>{label}</label><input id={`signup-${name}`} name={name} type={type} value={formData[name]} placeholder={placeholder} autoComplete={autoComplete} onChange={handleInputChange} /></div>)}
      <label className="signup-form__agreement"><input type="checkbox" checked={agreedToTerms} onChange={(event) => setAgreedToTerms(event.target.checked)} /><span><a href="#terms">{text.terms}</a> &amp; <a href="#privacy">{text.privacy}</a>{text.agree}</span></label>
      {errorMessage && <p className="signup-form__error">{errorMessage}</p>}
      <Button type="submit" fullWidth disabled={isSubmitting}>{isSubmitting ? text.submitting : text.submit}</Button>
    </form>
    <p className="signup-form__login">{text.account} <Link to="/login">{text.login}</Link></p>
  </section>;
}

export default SignupForm;
