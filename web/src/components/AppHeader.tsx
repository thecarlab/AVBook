import { BookIcon, FlaskIcon, QuizIcon, RoadLogo } from "./Icons";

interface AppHeaderProps {
  compact?: boolean;
  chapterId?: number;
}

export function AppHeader({ compact = false, chapterId }: AppHeaderProps) {
  return (
    <header className="app-header">
      <a className="brand" href="#/" aria-label="Autonomous Driving Lab home">
        <RoadLogo className="brand-mark" />
        <span>Autonomous Driving Lab</span>
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
