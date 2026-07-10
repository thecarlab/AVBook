import { useEffect, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { ArrowIcon, BookIcon, FlaskIcon } from "../components/Icons";
import { chapters } from "../data/chapters";
import { readProgress, type CourseProgress } from "../lib/progress";

export function HomePage() {
  const [progress, setProgress] = useState<CourseProgress>(() => readProgress());

  useEffect(() => {
    const update = () => setProgress(readProgress());
    window.addEventListener("storage", update);
    window.addEventListener("course-progress", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("course-progress", update);
    };
  }, []);

  const continueChapter = chapters.find((chapter) => chapter.id === progress.lastChapter) ?? chapters[0];
  const percent = Math.round((progress.completed.length / chapters.length) * 100);

  return (
    <div className="site-shell">
      <AppHeader chapterId={continueChapter.id} />
      <main id="main-content">
        <section className="home-hero" aria-labelledby="home-heading">
          <div className="hero-copy">
            <h1 id="home-heading">Learn autonomous driving by doing.</h1>
            <p>Explore 14 chapters, run browser-based experiments, and check your understanding with a fresh quiz every time.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#/chapter/1">Start Chapter 1 <ArrowIcon /></a>
              <a className="button button-secondary" href="#chapters">Browse chapters <ArrowIcon /></a>
            </div>
            <div className="course-progress" aria-label={`${progress.completed.length} of 14 chapters complete`}>
              <BookIcon />
              <span>{progress.completed.length} of 14 chapters complete</span>
              <span className="progress-track"><span style={{ width: `${percent}%` }} /></span>
            </div>
          </div>
          <div className="hero-visual">
            <img src="./assets/autonomous-intersection.png" alt="Autonomous car using sensors to plan a route through an intersection" />
          </div>
        </section>

        <section className="chapter-browser" id="chapters" aria-labelledby="chapters-heading">
          <div className="section-heading-row">
            <div>
              <h2 id="chapters-heading">Fourteen connected chapters</h2>
              <p>Move from foundations and sensing to planning, security, testing, and vehicle computing.</p>
            </div>
            <span className="chapter-count">14 chapters · 28 demos · 1,400 questions</span>
          </div>
          <ol className="chapter-rail">
            {chapters.map((chapter) => (
              <li key={chapter.id} className={progress.completed.includes(chapter.id) ? "is-complete" : ""}>
                <a href={`#/chapter/${chapter.id}`}>
                  <span className="chapter-number">{String(chapter.id).padStart(2, "0")}</span>
                  <span>{chapter.shortTitle}</span>
                  <ArrowIcon />
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section className="continue-panel" aria-labelledby="continue-heading">
          <div className="continue-graphic" aria-hidden="true">
            <span className="radar-ring ring-one" />
            <span className="radar-ring ring-two" />
            <span className="route-dot dot-one" />
            <span className="route-dot dot-two" />
            <svg viewBox="0 0 280 140"><path d="M15 115 C70 20 160 130 265 28" /></svg>
          </div>
          <div className="continue-copy">
            <h2 id="continue-heading">Continue learning</h2>
            <h3>Chapter {continueChapter.id} · {continueChapter.title}</h3>
            <p>{continueChapter.summary}</p>
            <span className="continue-status">{progress.completed.includes(continueChapter.id) ? `Best quiz: ${progress.bestScores[continueChapter.id]}/10` : "Ready to explore"}</span>
          </div>
          <div className="continue-actions">
            <a className="button button-primary" href={`#/chapter/${continueChapter.id}`}>Continue chapter <ArrowIcon /></a>
            <a className="button button-secondary" href={`#/chapter/${continueChapter.id}`}><FlaskIcon /> Try a demo</a>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>Autonomous Driving Lab</span>
        <span>Companion to <em>Introduction to Autonomous Driving</em></span>
      </footer>
    </div>
  );
}
