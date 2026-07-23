import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { connectGitHub, disconnectGitHub, getGitHubStatus, saveGitHubPublishToken } from "../../services/githubApi";
import { clearSessionUser, getSessionUser } from "../../services/session";
import { useLanguage } from "../../i18n/LanguageContext";
import "./LabPages.css";

function ProfilePage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const user = getSessionUser();
  const copy = {
    ko: { user: "사용자", eyebrow: "마이페이지", title: "마이페이지", subtitle: "계정 정보와 GitHub 연동 상태를 관리하세요.", noEmail: "로그인 이메일 정보 없음", mainLanguage: "주 사용 언어", status: "가입 상태", active: "활성", account: "계정", accountTitle: "계정 관리", accountHelp: "현재 기기에서 안전하게 로그아웃할 수 있습니다.", logout: "로그아웃", logoutConfirm: "로그아웃하시겠습니까?", githubTitle: "GitHub 학습 기록 연동", githubHelp: "통과한 문제 조건과 Solution 코드를 선택한 저장소에 커밋합니다.", checking: "GitHub 연결 상태를 확인하고 있습니다.", connected: "GitHub 저장소 연동이 완료되었습니다.", badge: "GitHub 연동됨", privateRepo: "Private 저장소", publicRepo: "Public 저장소", view: "저장소 보기", disconnect: "연결 해제", url: "GitHub 저장소 URL", connecting: "GitHub로 이동하고 있습니다...", connect: "GitHub 저장소 연결", checkFailed: "GitHub 연결 상태를 확인하지 못했습니다." },
    en: { user: "User", eyebrow: "MY PAGE", title: "My page", subtitle: "Manage your account and GitHub connection.", noEmail: "No login email available", mainLanguage: "Primary language", status: "Account status", active: "Active", account: "ACCOUNT", accountTitle: "Account management", accountHelp: "Sign out safely from this device.", logout: "Log out", logoutConfirm: "Would you like to log out?", githubTitle: "GitHub learning history", githubHelp: "Commit passed problem requirements and Solution code to your selected repository.", checking: "Checking your GitHub connection.", connected: "Your GitHub repository is connected.", badge: "GitHub connected", privateRepo: "Private repository", publicRepo: "Public repository", view: "View repository", disconnect: "Disconnect", url: "GitHub repository URL", connecting: "Opening GitHub...", connect: "Connect GitHub repository", checkFailed: "Could not check the GitHub connection." },
    ja: { user: "ユーザー", eyebrow: "マイページ", title: "マイページ", subtitle: "アカウント情報とGitHub連携を管理します。", noEmail: "ログインメール情報がありません", mainLanguage: "主な使用言語", status: "登録状態", active: "有効", account: "アカウント", accountTitle: "アカウント管理", accountHelp: "この端末から安全にログアウトできます。", logout: "ログアウト", logoutConfirm: "ログアウトしますか？", githubTitle: "GitHub学習記録連携", githubHelp: "合格した問題の条件とSolutionコードを選択したリポジトリにコミットします。", checking: "GitHubの接続状態を確認しています。", connected: "GitHubリポジトリとの連携が完了しました。", badge: "GitHub連携済み", privateRepo: "Privateリポジトリ", publicRepo: "Publicリポジトリ", view: "リポジトリを見る", disconnect: "連携解除", url: "GitHubリポジトリURL", connecting: "GitHubを開いています...", connect: "GitHubリポジトリを連携", checkFailed: "GitHubの接続状態を確認できませんでした。" },
  }[language];
  const displayName = user?.name || copy.user;
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [githubStatus, setGitHubStatus] = useState({ connected: false });
  const [isGithubStatusLoading, setIsGithubStatusLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [connectionCompleted] = useState(
    () => new URLSearchParams(window.location.search).get("github") === "connected",
  );

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const githubToken = parameters.get("github_token");
    if (githubToken) {
      saveGitHubPublishToken(githubToken);
      window.history.replaceState({}, "", "/profile?github=connected");
    }
    getGitHubStatus()
      .then(setGitHubStatus)
      .catch((error) => setErrorMessage(`${copy.checkFailed} ${error.message}`))
      .finally(() => setIsGithubStatusLoading(false));
  }, [copy.checkFailed]);

  async function handleConnect(event) {
    event.preventDefault();
    try {
      setIsConnecting(true);
      setErrorMessage("");
      const result = await connectGitHub(repositoryUrl);
      window.location.href = result.installUrl;
    } catch (error) {
      setErrorMessage(error.message);
      setIsConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectGitHub();
      setGitHubStatus({ connected: false });
      setRepositoryUrl("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleLogout() {
    const shouldLogout = window.confirm(copy.logoutConfirm);

    if (!shouldLogout) return;

    localStorage.removeItem("accessToken");
    clearSessionUser();
    navigate("/login", { replace: true });
  }

  return (
    <div className="lab-page lab-page--narrow">
      <div className="lab-page__heading">
        <div>
          <span className="lab-page__eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      <section className="surface-card profile-card">
        <div className="profile-card__avatar">{displayName.slice(0, 1)}</div>
        <div>
          <h2>{displayName}</h2>
          <p>{user?.email || copy.noEmail}</p>
        </div>

        <dl>
          <div>
            <dt>{copy.mainLanguage}</dt>
            <dd>Java</dd>
          </div>
          <div>
            <dt>{copy.status}</dt>
            <dd>{copy.active}</dd>
          </div>
        </dl>
      </section>

      <section className="surface-card account-card">
        <div>
          <span className="lab-page__eyebrow">{copy.account}</span>
          <h2>{copy.accountTitle}</h2>
          <p>{copy.accountHelp}</p>
        </div>
        <button type="button" onClick={handleLogout}>{copy.logout}</button>
      </section>

      <section className="surface-card github-card">
        <div>
          <span className="lab-page__eyebrow">GitHub</span>
          <h2>{copy.githubTitle}</h2>
          <p>{copy.githubHelp}</p>
        </div>

        {isGithubStatusLoading ? (
          <p className="github-status-loading" role="status">{copy.checking}</p>
        ) : githubStatus.connected ? (
          <>
            {connectionCompleted && (
              <p className="github-success" role="status">{copy.connected}</p>
            )}
            <div className="github-connection">
              <div>
                <span className="github-connection__status">{copy.badge}</span>
                <strong>{githubStatus.owner}/{githubStatus.repository}</strong>
                <span>{githubStatus.privateRepository ? copy.privateRepo : copy.publicRepo}</span>
              </div>
              <a href={githubStatus.url} target="_blank" rel="noreferrer">{copy.view}</a>
              <button type="button" onClick={handleDisconnect}>{copy.disconnect}</button>
            </div>
          </>
        ) : (
          <form className="github-connect-form" onSubmit={handleConnect}>
            <label htmlFor="github-repository">{copy.url}</label>
            <input
              id="github-repository"
              type="url"
              required
              placeholder="https://github.com/사용자명/저장소명"
              value={repositoryUrl}
              onChange={(event) => setRepositoryUrl(event.target.value)}
            />
            <button type="submit" disabled={isConnecting}>
              {isConnecting ? copy.connecting : copy.connect}
            </button>
          </form>
        )}
        {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
      </section>
    </div>
  );
}

export default ProfilePage;
