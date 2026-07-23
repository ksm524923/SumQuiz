import { FileUp, ListChecks, ScanSearch } from "lucide-react";
import { Link } from "react-router";
import LanguageSelector from "../components/common/LanguageSelector";
import SignupForm from "../components/signup/SignupForm";
import { useLanguage } from "../i18n/LanguageContext";
import "./SignupPage.css";

function SignupPage() {
  const { t, language } = useLanguage();
  const copy = {
    ko: { title1: "내 Java 코드로 배우는", title2: "맞춤형 문법 학습", desc: "Java 파일을 업로드하면 AI가 코드의 핵심 문법을 분석하고 코드에 맞춘 퀴즈로 학습을 이어갈 수 있어요.", steps: ["Java 파일을 간편하게 등록하세요.", "AI가 코드의 핵심 문법을 분석해 드려요.", "분석 결과를 바탕으로 맞춤 퀴즈를 풀어요."] },
    en: { title1: "Learn from your Java code", title2: "Personalized grammar learning", desc: "Upload a Java file and AI will analyze its key grammar and create personalized learning problems.", steps: ["Upload your Java file easily.", "AI analyzes the key grammar in your code.", "Practice with personalized quizzes."] },
    ja: { title1: "自分のJavaコードで学ぶ", title2: "カスタム文法学習", desc: "Javaファイルをアップロードすると、AIが主要な文法を分析し、コードに合った問題を作成します。", steps: ["Javaファイルを簡単に登録します。", "AIがコードの主要文法を分析します。", "分析結果に基づく問題を解きます。"] },
  }[language];
  const features = [[FileUp, t("uploadFile")], [ScanSearch, t("analyzeGrammar")], [ListChecks, t("customQuiz")]];
  return (
    <div className="signup-page">
      <header className="signup-page__header"><Link className="signup-page__logo" to="/login"><img src="/images/hwv-logo-cutout.png" alt="HWV" /></Link><LanguageSelector /></header>
      <main className="signup-page__main">
        <section className="signup-page__introduction"><p className="signup-page__eyebrow">{t("startLearning")}</p><h1>{copy.title1}<br /><span>{copy.title2}</span></h1><p className="signup-page__description">{copy.desc}</p>
          <div className="signup-page__features">{features.map(([Icon, title], index) => <div key={title}><span className="signup-page__feature-icon"><Icon /><b>{index + 1}</b></span><p><strong>{title}</strong>{copy.steps[index]}</p></div>)}</div>
        </section><SignupForm />
      </main>
      <footer className="signup-page__footer"><div><a href="#terms">{t("terms")}</a><span /><a href="#privacy">{t("privacy")}</a></div><p>© 2026 HWV. All rights reserved.</p></footer>
    </div>
  );
}
export default SignupPage;
