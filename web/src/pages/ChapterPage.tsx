import { useEffect } from "react";
import { AppHeader } from "../components/AppHeader";
import { DemoRenderer } from "../components/demos/DemoRenderer";
import { ArrowIcon, BookIcon, FlaskIcon, QuizIcon } from "../components/Icons";
import { chapters } from "../data/chapters";
import { readProgress, rememberChapter } from "../lib/progress";
import type { Chapter } from "../types";

interface ChapterPageProps {
  chapter: Chapter;
}

export function ChapterPage({ chapter }: ChapterPageProps) {
  useEffect(() => rememberChapter(chapter.id), [chapter.id]);

  const previous = chapters[chapter.id - 2];
  const next = chapters[chapter.id];
  const completed = readProgress().completed.includes(chapter.id);
  const highlightSections = chapter.sections.filter((section) => section.summary).slice(0, 3);
  const overviewSections = highlightSections.length >= 2 ? highlightSections : chapter.sections.slice(0, 3);

  function scrollToSection(event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="site-shell chapter-shell">
      <AppHeader compact chapterId={chapter.id} />
      <div className="chapter-layout">
        <aside className="chapter-index" aria-label="Book chapters">
          <a className="chapter-home" href="#/" aria-label="Course home"><BookIcon /></a>
          {chapters.map((item) => (
            <a
              key={item.id}
              className={item.id === chapter.id ? "active" : ""}
              href={`#/chapter/${item.id}`}
              aria-label={`Chapter ${item.id}: ${item.title}`}
              aria-current={item.id === chapter.id ? "page" : undefined}
            >
              {item.id}
            </a>
          ))}
        </aside>
        <main id="main-content" className="chapter-main">
          <header className="chapter-hero">
            <p className="chapter-label">Chapter {chapter.id}</p>
            <div className="chapter-title-row">
              <div>
                <h1>{chapter.title}</h1>
                <p>{chapter.summary}</p>
              </div>
              <div className="chapter-title-tools">
                <div className="chapter-progress-mini"><span>Chapter progress</span><strong>{completed ? "100%" : "0%"}</strong><i><b style={{ width: completed ? "100%" : "0%" }} /></i></div>
                <span className="book-page-link">
                  <BookIcon /> Chapter {chapter.id} reading map
                </span>
              </div>
            </div>
            <nav className="chapter-tabs" aria-label="On this page">
              <a href={`#/chapter/${chapter.id}`} onClick={(event) => scrollToSection(event, "overview")}><BookIcon /> Overview</a>
              {chapter.demos.length > 0
                ? <a href={`#/chapter/${chapter.id}`} onClick={(event) => scrollToSection(event, "demos")}><FlaskIcon /> Data labs</a>
                : null}
              <a href={`#/chapter/${chapter.id}`} onClick={(event) => scrollToSection(event, "quiz")}><QuizIcon /> Quiz</a>
            </nav>
          </header>

          <section className="chapter-overview" id="overview" aria-labelledby="overview-heading">
            <div className="section-intro">
              <span className="section-number">01</span>
              <div>
                <h2 id="overview-heading">What this chapter covers</h2>
                <p>{chapter.demos.length > 0
                  ? "Use the book sections as your reading map, then analyze the recorded evidence below."
                  : "Use the book sections as your reading map, then test your understanding in the case-based quiz."}</p>
              </div>
            </div>
            <div className="overview-highlights">
              {overviewSections.map((section) => (
                <div key={section.number} className="overview-highlight">
                  <span>{section.number}</span>
                  <small>Chapter {chapter.id} · Section {section.number}</small>
                  <strong>{section.title}</strong>
                  {section.summary ? <p>{section.summary}</p> : null}
                </div>
              ))}
            </div>
            <details className="reading-map">
              <summary>Open the complete chapter reading map</summary>
              <ol className="section-list">
                {chapter.sections.map((section) => (
                  <li key={section.number}>
                    <span>Section {section.number}</span>
                    <strong>{section.title}</strong>
                  </li>
                ))}
              </ol>
            </details>
          </section>

          {chapter.demos.length > 0 ? (
            <section className="demos-section" id="demos" aria-labelledby="demos-heading">
              <div className="section-intro">
                <span className="section-number">02</span>
                <div>
                  <h2 id="demos-heading">Recorded-data labs</h2>
                  <p>Inspect authentic records, traces, or media; test an analytical decision; and keep the source limitations visible.</p>
                </div>
              </div>
              <div className="demo-stack">
                {chapter.demos.map((demo, index) => (
                  <DemoRenderer key={demo.id} demo={demo} index={index + 1} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="quiz-entry" id="quiz" aria-labelledby="quiz-entry-heading">
            <div className="quiz-entry-icon"><QuizIcon /></div>
            <div>
              <span className="section-number">{chapter.demos.length > 0 ? "03" : "02"}</span>
              <h2 id="quiz-entry-heading">Check your understanding</h2>
              <p>Ten case-based questions are selected from this chapter’s 100-question bank to test application, diagnosis, comparison, cause, and transfer—not wording recall.</p>
            </div>
            <a className="button button-dark" href={`#/chapter/${chapter.id}/quiz`}>Start quiz <ArrowIcon /></a>
          </section>

          <nav className="chapter-pagination" aria-label="Adjacent chapters">
            {previous ? <a href={`#/chapter/${previous.id}`}><span>Previous</span>{previous.id}. {previous.shortTitle}</a> : <span />}
            {next ? <a className="next" href={`#/chapter/${next.id}`}><span>Next</span>{next.id}. {next.shortTitle}</a> : <a className="next" href="#/"><span>Finished</span>Course home</a>}
          </nav>
        </main>
      </div>
    </div>
  );
}
