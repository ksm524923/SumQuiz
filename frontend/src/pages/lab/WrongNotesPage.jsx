import { useEffect, useState } from "react";
import { Link } from "react-router";

import { getWrongNotes } from "../../services/problemApi";
import { useLanguage } from "../../i18n/LanguageContext";
import "./LabPages.css";

function WrongNotesPage() {
  const { language, t } = useLanguage();
  const copy = {
    ko: { eyebrow: "AI 문제", title: "오답노트", subtitle: "보완이 필요했던 문제와 피드백을 다시 확인하세요.", empty: "저장된 오답이 없습니다.", emptyHelp: "Java 문제를 풀면 틀린 답과 해설이 여기에 저장됩니다.", create: "Java 문제 만들기", expected: "예상 통과", again: "다시 풀기", locale: "ko-KR" },
    en: { eyebrow: "AI PROBLEMS", title: "Wrong answers", subtitle: "Review problems and feedback that need improvement.", empty: "No wrong answers saved.", emptyHelp: "Incorrect answers and feedback will appear here after you solve Java problems.", create: "Create Java problems", expected: "Expected passes", again: "Solve again", locale: "en-US" },
    ja: { eyebrow: "AI問題", title: "復習ノート", subtitle: "改善が必要だった問題とフィードバックを確認しましょう。", empty: "保存された復習問題はありません。", emptyHelp: "Java問題を解くと、間違えた回答と解説がここに保存されます。", create: "Java問題を作る", expected: "予想合格", again: "もう一度解く", locale: "ja-JP" },
  }[language];
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    getWrongNotes().then((result) => {
      if (active) {
        setNotes(result);
      }
    }).catch((error) => { if (active) setErrorMessage(error.message); })
      .finally(() => { if (active) setIsLoading(false); });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="lab-page">
      <div className="lab-page__heading">
        <div>
          <span className="lab-page__eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      <section className="surface-card">
        {isLoading ? (
          <div className="large-empty">{t("loadingWrongNotes")}</div>
        ) : errorMessage ? (
          <p className="form-error" role="alert">{errorMessage}</p>
        ) : notes.length === 0 ? (
          <div className="large-empty">
            <strong>{copy.empty}</strong>
            <span>{copy.emptyHelp}</span>
            <Link className="lab-primary-link" to="/problems/new">
              {copy.create}
            </Link>
          </div>
        ) : (
          <div className="note-list">
            {notes.map((note) => (
              <article key={note.id}>
                <div>
                  <span>{new Date(note.submittedAt).toLocaleString(copy.locale)}</span>
                  <h2>{note.problemTitle}</h2>
                  <p>
                    {note.grammarName} · {copy.expected} {note.passedCount}/{note.totalCount} · {note.explanation}
                  </p>
                </div>
                <Link to={"/problems/" + note.problemId}>{copy.again}</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default WrongNotesPage;
