import { Link, NavLink, useNavigate } from "react-router";

import { getSessionUser } from "../../services/session";
import Button from "./Button";
import "./Header.css";

function Header({ simple = false }) {
  const navigate = useNavigate();
  const user = getSessionUser();
  const displayName = user?.name || "사용자";

  function getNavigationClass({ isActive }) {
    return isActive
      ? "header__navigation-link header__navigation-link--active"
      : "header__navigation-link";
  }

  return (
    <header className="header">
      <Link className="header__logo" to={simple ? "/login" : "/home"}>
        <img src="/images/hwv-logo-cutout.png" alt="HWV" />
      </Link>

      {simple ? (
        <div className="header__simple-menu">
          <Button variant="outline" onClick={() => navigate("/signup")}>
            회원가입
          </Button>
        </div>
      ) : (
        <>
          <nav className="header__navigation">
            <NavLink className={getNavigationClass} to="/home">홈</NavLink>
            <NavLink className={getNavigationClass} to="/upload">업로드</NavLink>
            <NavLink className={getNavigationClass} to="/summary">Java 문제</NavLink>
            <NavLink className={getNavigationClass} to="/quiz">코딩 연습</NavLink>
            <NavLink className={getNavigationClass} to="/report">학습 리포트</NavLink>
          </nav>

          <div className="header__user">
            <button
              className="header__profile"
              type="button"
              onClick={() => navigate("/profile")}
            >
              <span className="header__avatar">{displayName.slice(0, 1)}</span>
              <span className="header__user-name">{displayName}</span>
            </button>
          </div>
        </>
      )}
    </header>
  );
}

export default Header;
