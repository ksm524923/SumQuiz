import { useEffect, useState } from "react";

import { getLearningStatistics } from "../../services/problemApi";
import { useLanguage } from "../../i18n/LanguageContext";
import "./LabPages.css";

function StatisticsPage() {
  const { language, t } = useLanguage();
  const copy = {
    ko: { title: "학습 통계", subtitle: "AI 코딩 문제 생성과 예상 테스트 통과 기록을 확인하세요.", failed: "학습 통계를 불러오지 못했습니다.", generated: "생성된 문제", success: "AI 예상 성공", improve: "보완 필요", count: "개", overall: "전체 AI 예상 통과율", accuracy: "정답률", reviews: "AI 코드 검토", times: "회 기준", category: "문법별 예상 통과율", categoryEmpty: "문제를 풀면 문법별 정답률이 표시됩니다.", weekly: "최근 7일 일별 정답률", weekDays: ["월", "화", "수", "목", "금", "토", "일"], daySuffix: "요일", correct: "정답" },
    en: { title: "Learning statistics", subtitle: "Review generated AI coding problems and expected test results.", failed: "We couldn't load your learning statistics.", generated: "Generated problems", success: "Expected passes", improve: "Needs improvement", count: "", overall: "Overall expected pass rate", accuracy: "Accuracy", reviews: "Based on", times: " AI code reviews", category: "Expected pass rate by concept", categoryEmpty: "Solve problems to see accuracy by Java concept.", weekly: "Daily accuracy for the last 7 days", weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], daySuffix: "", correct: "correct" },
    ja: { title: "学習統計", subtitle: "AIコーディング問題の生成数と予想テスト合格記録を確認できます。", failed: "学習統計を読み込めませんでした。", generated: "生成した問題", success: "AI予想成功", improve: "改善が必要", count: "問", overall: "全体AI予想合格率", accuracy: "正答率", reviews: "AIコードレビュー", times: "回基準", category: "文法別予想合格率", categoryEmpty: "問題を解くと文法別の正答率が表示されます。", weekly: "直近7日間の日別正答率", weekDays: ["月", "火", "水", "木", "金", "土", "日"], daySuffix: "曜日", correct: "正解" },
  }[language];
  const grammarLabels = {
    ko: {},
    en: {
      "조건문": "Conditionals", "배열": "Arrays", "메서드 선언": "Method declarations", "클래스 선언": "Class declarations",
      "for문": "For loops", "향상된 for문": "Enhanced for loops", "while문": "While loops", "반복문": "Loops",
      "예외 처리": "Exception handling", "컬렉션": "Collections", "제네릭": "Generics", "상속": "Inheritance",
      "인터페이스": "Interfaces", "람다식": "Lambda expressions", "스트림": "Streams",
    },
    ja: {
      "조건문": "条件文", "배열": "配列", "메서드 선언": "メソッド宣言", "클래스 선언": "クラス宣言",
      "for문": "for文", "향상된 for문": "拡張for文", "while문": "while文", "반복문": "繰り返し文",
      "예외 처리": "例外処理", "컬렉션": "コレクション", "제네릭": "ジェネリクス", "상속": "継承",
      "인터페이스": "インターフェース", "람다식": "ラムダ式", "스트림": "ストリーム",
    },
  }[language];
  const displayGrammar = (name) => grammarLabels[name?.trim()] || name;
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    getLearningStatistics().then((result) => {
      if (active) {
        setStatistics(result);
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

  const correctAnswers = statistics?.correctAnswers ?? 0;
  const incorrectAnswers = statistics?.incorrectAnswers ?? 0;
  const answerCount = correctAnswers + incorrectAnswers;
  const accuracy =
    statistics?.accuracy ??
    (answerCount ? Math.round((correctAnswers / answerCount) * 100) : 0);
  const weekDays = copy.weekDays;
  const weeklyAttempts = Array.from(
    { length: 7 },
    (_, index) => statistics?.weeklyAttempts?.[index] ?? 0,
  );
  const dailyAccuracy = Array.from({ length: 7 }, (_, index) => {
    const item = statistics?.dailyAccuracy?.[index];
    return {
      accuracy: Math.max(0, Math.min(100, item?.accuracy ?? 0)),
      correct: item?.correct ?? 0,
      total: item?.total ?? weeklyAttempts[index],
    };
  });
  const accuracyEmoji = (value) => {
    if (value <= 20) return "😭";
    if (value <= 40) return "😢";
    if (value <= 60) return "😐";
    if (value <= 80) return "😏";
    return "🤭";
  };
  const weeklyPoints = dailyAccuracy.map((item, index) => ({
    day: weekDays[index],
    ...item,
    emoji: accuracyEmoji(item.accuracy),
    x: 70 + index * (1060 / 6),
    y: 165 - item.accuracy * 1.2,
  }));
  const weeklyPolyline = weeklyPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const weeklyArea = `70,165 ${weeklyPolyline} 1130,165`;

  if (isLoading) {
    return <div className="lab-page"><section className="large-empty">{t("loadingStats")}</section></div>;
  }

  if (errorMessage && !statistics) {
    return (
      <div className="lab-page"><section className="large-empty">
        <strong>{copy.failed}</strong><span>{errorMessage}</span>
        <button type="button" className="lab-primary-link" onClick={handleReload}>{t("retry")}</button>
      </section></div>
    );
  }

  return (
    <div className="lab-page">
      <div className="lab-page__heading">
        <div>
          <span className="lab-page__eyebrow">HWV CODE LAB</span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      <section className="metric-grid statistics-metrics">
        <article className="metric-card">
          <span>{copy.generated}</span>
          <strong>
            {statistics?.generatedProblems ?? 0}<small>{copy.count}</small>
          </strong>
        </article>
        <article className="metric-card">
          <span>{copy.success}</span>
          <strong>
            {correctAnswers}<small>{copy.count}</small>
          </strong>
        </article>
        <article className="metric-card">
          <span>{copy.improve}</span>
          <strong>
            {incorrectAnswers}<small>{copy.count}</small>
          </strong>
        </article>
      </section>

      <div className="statistics-grid">
        <section className="surface-card accuracy-card">
          <h2>{copy.overall}</h2>
          <div
            className="accuracy-ring"
            style={{
              "--accuracy": accuracy * 3.6 + "deg",
            }}
          >
            <div>
              <strong>{accuracy}%</strong>
              <span>{copy.accuracy}</span>
            </div>
          </div>
          <p>{copy.reviews} {answerCount}{copy.times}</p>
        </section>

        <section className="surface-card category-chart">
          <h2>{copy.category}</h2>
          {statistics?.categoryAccuracy?.length ? (
            <div>
              {statistics.categoryAccuracy.map((item) => (
              <article key={item.name}>
                <span>{displayGrammar(item.name)}</span>
                <div>
                  <b style={{ width: item.value + "%" }} />
                </div>
                <strong>{item.value}%</strong>
              </article>
              ))}
            </div>
          ) : (
            <div className="compact-empty">
              {copy.categoryEmpty}
            </div>
          )}
        </section>

        <section className="surface-card weekly-chart">
          <h2>{copy.weekly}</h2>
          <div className="weekly-chart__line">
            <svg
              viewBox="0 0 1200 220"
              role="img"
              aria-label={`최근 7일 일별 정답률: ${dailyAccuracy.map((item) => item.accuracy + "%").join(", ")}`}
            >
              <defs>
                <linearGradient id="weekly-accuracy-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec6b2d" stopOpacity="0.24" />
                  <stop offset="70%" stopColor="#f5a06f" stopOpacity="0.09" />
                  <stop offset="100%" stopColor="#fff8f2" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 20, 40, 60, 80, 100].map((percentage) => (
                <g key={percentage}>
                  <line className="weekly-chart__grid-line" x1="70" x2="1130" y1={165 - percentage * 1.2} y2={165 - percentage * 1.2} />
                  <text className="weekly-chart__axis-label" x="48" y={169 - percentage * 1.2}>{percentage}%</text>
                </g>
              ))}
              <polygon className="weekly-chart__area" points={weeklyArea} />
              <polyline className="weekly-chart__polyline" points={weeklyPolyline} />
              {weeklyPoints.map((point) => (
                <g key={point.day}>
                  <text className="weekly-chart__value" x={point.x} y={Math.max(18, point.y - 14)}>
                    {point.accuracy}%
                  </text>
                  <text className="weekly-chart__emoji" x={point.x} y={point.y + 6}>{point.emoji}</text>
                  <text className="weekly-chart__day" x={point.x} y="207">{point.day}</text>
                  <title>{`${point.day}${copy.daySuffix}: ${point.correct}/${point.total} ${copy.correct}, ${copy.accuracy} ${point.accuracy}%`}</title>
                </g>
              ))}
            </svg>
          </div>
        </section>
      </div>
    </div>
  );
}

export default StatisticsPage;
