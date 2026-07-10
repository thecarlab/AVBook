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
  const highlightSections = chapter.sections
    .filter((section) => !/^(Introduction|Hands-on Exercises|Conclusion)$/i.test(section.title))
    .slice(0, 3);
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
                  <BookIcon /> Book pages {chapter.pageStart}–{chapter.pageEnd}
                </span>
              </div>
            </div>
            <nav className="chapter-tabs" aria-label="On this page">
              <a href={`#/chapter/${chapter.id}`} onClick={(event) => scrollToSection(event, "overview")}><BookIcon /> Overview</a>
              <a href={`#/chapter/${chapter.id}`} onClick={(event) => scrollToSection(event, "demos")}><FlaskIcon /> Demos</a>
              <a href={`#/chapter/${chapter.id}`} onClick={(event) => scrollToSection(event, "quiz")}><QuizIcon /> Quiz</a>
            </nav>
          </header>

          <section className="chapter-overview" id="overview" aria-labelledby="overview-heading">
            <div className="section-intro">
              <span className="section-number">01</span>
              <div>
                <h2 id="overview-heading">What this chapter covers</h2>
                <p>Use the book sections as your reading map, then test the ideas in the browser labs below.</p>
              </div>
            </div>
            <div className="overview-highlights">
              {overviewSections.map((section, index) => (
                <div key={section.number} className="overview-highlight">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{section.title}</strong>
                  <small>Section {section.number} · p. {section.page}</small>
                </div>
              ))}
            </div>
            <details className="reading-map">
              <summary>Open the complete chapter reading map</summary>
              <ol className="section-list">
                {chapter.sections.map((section) => (
                  <li key={section.number}>
                    <span>{section.number}</span>
                    <strong>{section.title}</strong>
                    <span className="page-reference">p. {section.page}</span>
                  </li>
                ))}
              </ol>
            </details>
          </section>

          <section className="demos-section" id="demos" aria-labelledby="demos-heading">
            <div className="section-intro">
              <span className="section-number">02</span>
              <div>
                <h2 id="demos-heading">Interactive demos</h2>
                <p>Change one variable at a time, observe the result, and connect it back to the chapter.</p>
              </div>
            </div>
            <div className="demo-stack">
              {chapter.demos.map((demo, index) => (
                <DemoRenderer key={demo.id} demo={demo} chapterId={chapter.id} index={index + 1} />
              ))}
            </div>
          </section>

          <section className="quiz-entry" id="quiz" aria-labelledby="quiz-entry-heading">
            <div className="quiz-entry-icon"><QuizIcon /></div>
            <div>
              <span className="section-number">03</span>
              <h2 id="quiz-entry-heading">Check your understanding</h2>
              <p>Ten questions are randomly selected from this chapter’s 100-question bank. Answer choices are reshuffled for every attempt.</p>
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
