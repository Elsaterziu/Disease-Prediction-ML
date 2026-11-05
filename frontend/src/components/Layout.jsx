import { BarChart3, BookOpen, Home, ScanText } from "lucide-react";
import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Logo from "./Logo";

const NAV_ITEMS = [
  { to: "/", label: "Home", short: "Home", icon: Home, end: true },
  { to: "/analysis", label: "Symptom Analysis", short: "Check", icon: ScanText },
  { to: "/models", label: "Model Comparison", short: "Models", icon: BarChart3 },
  { to: "/methodology", label: "About & Methodology", short: "About", icon: BookOpen },
];

function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="header-logo" aria-label="Symptom2Disease home">
            <Logo />
          </Link>

          <nav className="top-nav" aria-label="Main navigation">
            {NAV_ITEMS.slice(1).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link to="/analysis" className="btn btn-accent btn-sm header-cta">
            <ScanText size={16} aria-hidden="true" />
            Start a check
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
            <p>
              Matches free-text symptom descriptions to 24 conditions and shows
              which words shaped the result.
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer">
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>

          <p className="footer-disclaimer">
            Symptom2Disease is an educational tool. It does not provide a
            medical diagnosis, advice or treatment. If you feel unwell, contact
            a qualified healthcare professional.
          </p>
        </div>
      </footer>

      <nav className="tab-bar" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <Icon size={21} aria-hidden="true" />
              <span>{item.short}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default Layout;
