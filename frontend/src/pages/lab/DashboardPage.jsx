import { useEffect, useState } from "react";
import { Link } from "react-router";

import { getDashboardSummary } from "../../services/problemApi";
import { getSessionUser } from "../../services/session";
import "./LabPages.css";

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const user = getSessionUser();

  useEffect(() => {
    let active = true;

    getDashboardSummary().then((result) => {
      if (active) {
        setSummary(result);
      }
    }).catch((error) => { if (active) setErrorMessage(error.message); })
      .finally(() => { if (active) setIsLoading(false); });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  function handleReload() {
    setIsLoading(true);
    setErrorMessage("");
    setReloadKey((value) => value + 1);
  }

  const cards = [
    {
      label: "생성된 문제",
      value: summary?.generatedProblems ?? 0,
      unit: "개",
      icon: "▤",
      description: "누적 생성 문제",
    },
    {
      label: "AI 예상 성공",
      value: summary?.correctAnswers ?? 0,
      unit: "개",
      icon: "✦",
      description: "통과한 제출",
    },
    {
      label: "보완 필요",
      value: summary?.incorrectAnswers ?? 0,
      unit: "개",
      icon: "!",
      description: "검토가 필요해요",
    },
    {
      label: "AI 예상 통과율",
      value: summary?.accuracy ?? 0,
      unit: "%",
      icon: "◎",
      description: "누적 학습 결과",
    },
  ];

  const hasProblems = (summary?.generatedProblems ?? 0) > 0;
  const hasAttempts = (summary?.correctAnswers ?? 0) + (summary?.incorrectAnswers ?? 0) > 0;
  const learningSteps = [
    { title: "학습할 Java 파일 업로드", description: "Java 파일을 업로드하여 분석을 시작하세요.", completed: hasProblems },
    { title: "AI가 핵심 Java 문법 3개 분석", description: "업로드한 코드에서 실제 사용된 문법을 추출합니다.", completed: hasProblems },
    { title: "핵심 문법마다 코딩 문제 1개씩 생성", description: "문법별 코딩 문제를 총 3개 생성합니다.", completed: hasProblems },
    { title: "코드를 작성하고 실행 결과 확인", description: "테스트 결과와 피드백으로 실력을 향상하세요.", completed: hasAttempts },
  ];

  if (isLoading) {
    return <div className="lab-page"><section className="large-empty">학습 현황을 불러오고 있습니다.</section></div>;
  }

  if (errorMessage && !summary) {
    return (
      <div className="lab-page"><section className="large-empty">
        <strong>학습 현황을 불러오지 못했습니다.</strong><span>{errorMessage}</span>
        <button type="button" className="lab-primary-link" onClick={handleReload}>다시 불러오기</button>
      </section></div>
    );
  }

  return (
    <div className="lab-page">
      <div className="lab-page__heading">
        <div>
          <span className="dashboard-kicker">HWV CODE LAB</span>
          <h1>
            안녕하세요, {user?.name || "사용자"}님 <span aria-hidden="true">👋</span>
          </h1>
          <p>
            Java 파일의 핵심 문법 3개를 분석해 문법별 코딩 문제를 만들어 줍니다.
          </p>
        </div>
      </div>

      {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}

      <section className="metric-grid">
        {cards.map((card) => (
          <article className="metric-card dashboard-metric-card" key={card.label}>
            <div>
              <span>{card.label}</span>
              <strong>
                {card.value}
                <small>{card.unit}</small>
              </strong>
              <small className="dashboard-metric-card__description">{card.description}</small>
            </div>
            <b aria-hidden="true">{card.icon}</b>
          </article>
        ))}
      </section>

      <div className="dashboard-grid">
        <section className="surface-card">
          <div className="surface-card__header">
            <h2>최근 제출</h2>
            <Link to="/wrong-notes">전체 보기</Link>
          </div>

          {summary?.recentAttempts?.length ? (
            <div className="activity-list">
              {summary.recentAttempts.map((attempt) => (
                <article key={attempt.id}>
                  <b className={attempt.passed ? "activity-status-icon activity-status-icon--passed" : "activity-status-icon"}>
                    {attempt.passed ? "✓" : "!"}
                  </b>
                  <div>
                    <Link to={`/problems/${attempt.problemId}`}><strong>{attempt.problemTitle}</strong></Link>
                    <span>
                      테스트 {attempt.passedCount}/{attempt.totalCount} 통과
                    </span>
                  </div>
                  <span
                    className={
                      attempt.passed
                        ? "result-pill result-pill--passed"
                        : "result-pill result-pill--failed"
                    }
                  >
                    {attempt.passed ? "성공" : "보완 필요"}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="compact-empty">
              아직 제출 기록이 없습니다. 학습자료를 업로드해 첫 문제를 만들어
              보세요.
            </div>
          )}
        </section>

        <section className="surface-card dashboard-guide">
          <h2>Java 학습 흐름</h2>
          <ol>
            {learningSteps.map((step, index) => (
              <li key={step.title} className={step.completed ? "dashboard-guide__step dashboard-guide__step--completed" : "dashboard-guide__step"}>
                <b>{index + 1}</b>
                <span><strong>{step.title}</strong><small>{step.description}</small></span>
                <i aria-label={step.completed ? "완료" : "진행 전"}>{step.completed ? "✓" : "○"}</i>
              </li>
            ))}
          </ol>
          <Link className="dashboard-guide__action" to="/problems/new">새 문제 만들기</Link>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
