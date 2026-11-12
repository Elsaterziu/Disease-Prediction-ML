import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import { useLanguage } from "./i18n/languageContext";
import Home from "./pages/Home";
import Methodology from "./pages/Methodology";
import SymptomAnalysis from "./pages/SymptomAnalysis";

// The dashboard pulls in Recharts, so it is loaded only when visited.
const ModelComparison = lazy(() => import("./pages/ModelComparison"));

function NotFound() {
  const { t } = useLanguage();
  return (
    <section className="container page-head">
      <span className="eyebrow">404</span>
      <h1>{t("notFound.title")}</h1>
      <p>
        {t("notFound.text")} <Link to="/">{t("notFound.home")}</Link> {t("notFound.or")}{" "}
        <Link to="/analysis">{t("notFound.check")}</Link>.
      </p>
    </section>
  );
}

function App() {
  const { t } = useLanguage();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="analysis" element={<SymptomAnalysis />} />
        <Route
          path="models"
          element={
            <Suspense fallback={<p className="container page-head muted">{t("app.loading")}</p>}>
              <ModelComparison />
            </Suspense>
          }
        />
        <Route path="methodology" element={<Methodology />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
