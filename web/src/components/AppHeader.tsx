import { BookIcon, FlaskIcon, QuizIcon } from "./Icons";

interface AppHeaderProps {
  compact?: boolean;
  chapterId?: number;
}

export function AppHeader({ compact = false, chapterId }: AppHeaderProps) {
  return (
    <header className="app-header">
      <a className="brand" href="https://www.thecarlab.org/" target="_blank" rel="noreferrer" aria-label="The CAR Lab website (opens in a new tab)">
        <img className="brand-mark" src="./carlab-logo.png" alt="" />
        <span className="brand-name"><strong>The CAR Lab</strong><small>Connected and Autonomous Research Laboratory</small></span>
      </a>
      {compact ? (
        <nav className="header-nav" aria-label="Chapter navigation">
          <a className="header-book-link" href="#/"><BookIcon /> All chapters</a>
        </nav>
      ) : (
        <nav className="header-nav" aria-label="Primary navigation">
          <a href="#chapters"><BookIcon /> Chapters</a>
          <a href="#chapters"><FlaskIcon /> Interactive Demos</a>
          <a href={chapterId ? `#/chapter/${chapterId}/quiz` : "#/chapter/1/quiz"}><QuizIcon /> Quizzes</a>
        </nav>
      )}
    </header>
  );
}
