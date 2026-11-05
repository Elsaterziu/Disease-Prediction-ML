import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Methodology from "./pages/Methodology";
import SymptomAnalysis from "./pages/SymptomAnalysis";

// The dashboard pulls in Recharts, so it is loaded only when visited.
const ModelComparison = lazy(() => import("./pages/ModelComparison"));

function NotFound() {
  return (
    <section className="container page-head">
      <span className="eyebrow">404</span>
      <h1>This page doesn’t exist.</h1>
      <p>
        The link may be outdated. <Link to="/">Go to the home page</Link> or{" "}
        <Link to="/analysis">start a symptom check</Link>.
      </p>
    </section>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="analysis" element={<SymptomAnalysis />} />
        <Route
          path="models"
          element={
            <Suspense fallback={<p className="container page-head muted">Loading…</p>}>
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
