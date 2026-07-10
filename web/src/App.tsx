import { lazy, Suspense, useEffect, useState } from "react";
import { chapters } from "./data/chapters";
import { HomePage } from "./pages/HomePage";

const ChapterPage = lazy(() => import("./pages/ChapterPage").then((module) => ({ default: module.ChapterPage })));
const QuizPage = lazy(() => import("./pages/QuizPage").then((module) => ({ default: module.QuizPage })));

interface Route {
  page: "home" | "chapter" | "quiz";
  chapterId?: number;
}

function parseRoute(): Route {
  const value = window.location.hash.replace(/^#\/?/, "");
  const quiz = value.match(/^chapter\/(\d+)\/quiz$/);
  if (quiz) return { page: "quiz", chapterId: Number(quiz[1]) };
  const chapter = value.match(/^chapter\/(\d+)$/);
  if (chapter) return { page: "chapter", chapterId: Number(chapter[1]) };
  return { page: "home" };
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute());

  useEffect(() => {
    const update = () => setRoute(parseRoute());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route.page, route.chapterId]);

  const chapter = chapters.find((item) => item.id === route.chapterId);
  if (route.page === "chapter" && chapter) {
    return <Suspense fallback={<PageLoading />}><ChapterPage chapter={chapter} /></Suspense>;
  }
  if (route.page === "quiz" && chapter) {
    return <Suspense fallback={<PageLoading />}><QuizPage chapter={chapter} /></Suspense>;
  }
  return <HomePage />;
}

function PageLoading() {
  return <main className="page-loading" aria-live="polite"><span /><p>Preparing the lab…</p></main>;
}
