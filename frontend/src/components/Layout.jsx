import { BarChart3, BookOpen, Home, ScanText } from "lucide-react";
import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/languageContext";
import LanguageSwitch from "./LanguageSwitch";
import Logo from "./Logo";

const NAV_ITEMS = [
  { to: "/", key: "home", icon: Home, end: true },
  { to: "/analysis", key: "analysis", icon: ScanText },
  { to: "/models", key: "models", icon: BarChart3 },
  { to: "/methodology", key: "methodology", icon: BookOpen },
];

function Layout() {
  const { pathname } = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        {t("layout.skip")}
      </a>

      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="header-logo" aria-label={t("nav.homeLink")}>
            <Logo />
          </Link>

          <nav className="top-nav" aria-label={t("nav.main")}>
            {NAV_ITEMS.slice(1).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {t(`nav.${item.key}`)}
              </NavLink>
            ))}
          </nav>

          <LanguageSwitch />

          <Link to="/analysis" className="btn btn-accent btn-sm header-cta">
            <ScanText size={16} aria-hidden="true" />
            {t("layout.cta")}
          </Link>
        </div>
      </header>

      <main id="main" className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Logo inverse />
            <p>{t("layout.footerTagline")}</p>
          </div>

          <nav className="footer-nav" aria-label={t("nav.footer")}>
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to}>
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          <p className="footer-disclaimer">{t("layout.disclaimer")}</p>
        </div>
      </footer>

      <nav className="tab-bar" aria-label={t("nav.main")}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <Icon size={21} aria-hidden="true" />
              <span>{t(`nav.short.${item.key}`)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default Layout;
