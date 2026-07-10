import { useMemo, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { ArrowIcon, BookIcon, CheckIcon, CloseIcon } from "../components/Icons";
import { createQuizAttempt } from "../data/quizBank";
import { questionBanks } from "../data/questions";
import { completeChapter } from "../lib/progress";
import type { Chapter, QuizAnswer, QuizQuestion } from "../types";

interface QuizPageProps {
  chapter: Chapter;
}

export function QuizPage({ chapter }: QuizPageProps) {
  const bank = questionBanks[chapter.id];
  const [attemptNumber, setAttemptNumber] = useState(0);
  const questions = useMemo(() => createQuizAttempt(bank, 10), [bank, attemptNumber]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const score = submitted
    ? questions.reduce((total, question) => total + (answers[question.id] === question.correctChoiceId ? 1 : 0), 0)
    : 0;

  function choose(questionId: string, choiceId: string) {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [questionId]: choiceId }));
  }

  function submit() {
    setSubmitted(true);
    completeChapter(chapter.id, questions.reduce(
      (total, question) => total + (answers[question.id] === question.correctChoiceId ? 1 : 0),
      0,
    ));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setAnswers({});
    setCurrent(0);
    setSubmitted(false);
    setAttemptNumber((number) => number + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="site-shell quiz-shell">
      <AppHeader compact chapterId={chapter.id} />
      <main id="main-content" className="quiz-main">
        {submitted ? (
          <QuizResults chapter={chapter} questions={questions} answers={answers} score={score} onRestart={restart} />
        ) : (
          <QuizAttempt
            chapter={chapter}
            questions={questions}
            answers={answers}
            current={current}
            onChoose={choose}
            onCurrent={setCurrent}
            onSubmit={submit}
          />
        )}
      </main>
    </div>
  );
}

interface QuizAttemptProps {
  chapter: Chapter;
  questions: QuizQuestion[];
  answers: Record<string, string>;
  current: number;
  onChoose: (questionId: string, choiceId: string) => void;
  onCurrent: (index: number) => void;
  onSubmit: () => void;
}

function QuizAttempt({ chapter, questions, answers, current, onChoose, onCurrent, onSubmit }: QuizAttemptProps) {
  const question = questions[current];
  const answeredCount = Object.keys(answers).length;
  const isLast = current === questions.length - 1;

  return (
    <div className="quiz-attempt">
      <a className="back-link" href={`#/chapter/${chapter.id}`}>← Chapter {chapter.id}</a>
      <header className="quiz-attempt-header">
        <div>
          <p className="chapter-label">Chapter {chapter.id} quiz</p>
          <h1>{chapter.title}</h1>
          <p>Ten questions selected from a 100-question bank. Results and explanations appear after submission.</p>
        </div>
        <span className="quiz-position">{current + 1} / 10</span>
      </header>
      <div className="quiz-progress-track" aria-hidden="true"><span style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
      <fieldset className="question-card">
        <legend><span>Question {current + 1}</span>{question.prompt}</legend>
        <div className="choice-list">
          {question.choices.map((choice, index) => (
            <label key={choice.id} className={answers[question.id] === choice.id ? "selected" : ""}>
              <input
                type="radio"
                name={question.id}
                value={choice.id}
                checked={answers[question.id] === choice.id}
                onChange={() => onChoose(question.id, choice.id)}
              />
              <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
              <span>{choice.text}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="quiz-controls">
        <button className="button button-secondary" type="button" onClick={() => onCurrent(Math.max(0, current - 1))} disabled={current === 0}>Previous</button>
        <span>{answeredCount} of 10 answered</span>
        {isLast ? (
          <button className="button button-dark" type="button" onClick={onSubmit} disabled={answeredCount < 10}>Submit quiz <ArrowIcon /></button>
        ) : (
          <button className="button button-primary" type="button" onClick={() => onCurrent(current + 1)} disabled={!answers[question.id]}>Next question <ArrowIcon /></button>
        )}
      </div>
      <nav className="question-dots" aria-label="Quiz questions">
        {questions.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`${index === current ? "active" : ""} ${answers[item.id] ? "answered" : ""}`}
            aria-label={`Go to question ${index + 1}${answers[item.id] ? ", answered" : ""}`}
            onClick={() => onCurrent(index)}
          >{index + 1}</button>
        ))}
      </nav>
    </div>
  );
}

interface QuizResultsProps {
  chapter: Chapter;
  questions: QuizQuestion[];
  answers: Record<string, string>;
  score: number;
  onRestart: () => void;
}

function QuizResults({ chapter, questions, answers, score, onRestart }: QuizResultsProps) {
  const message = score === 10
    ? "Excellent — every concept in this set is secure."
    : score >= 7
      ? `Great work — review ${10 - score === 1 ? "the one concept" : `the ${10 - score} concepts`} below, then try a fresh set.`
      : "Use the explanations below to revisit the chapter, then try a fresh set.";

  return (
    <div className="quiz-results">
      <a className="back-link" href={`#/chapter/${chapter.id}`}>← Chapter {chapter.id}</a>
      <header className="results-hero">
        <h1>Quiz results</h1>
        <div className="score"><strong>{score}</strong><span>/ 10</span></div>
        <p>{message}</p>
        <div className="results-actions">
          <button className="button button-dark" type="button" onClick={onRestart}>↻ Try another quiz</button>
          <a className="button button-secondary" href={`#/chapter/${chapter.id}`}><BookIcon /> Return to chapter</a>
        </div>
        <small>10 questions randomly selected from 100</small>
      </header>
      <div className="results-summary">
        <span><CheckIcon /> Correct</span>
        <span><CloseIcon /> Needs review</span>
        <strong><em>{score} correct</em> · {10 - score} to review</strong>
      </div>
      <ol className="answer-review">
        {questions.map((question, index) => {
          const selectedId = answers[question.id];
          const selected = question.choices.find((choice) => choice.id === selectedId);
          const correct = question.choices.find((choice) => choice.id === question.correctChoiceId);
          const isCorrect = selectedId === question.correctChoiceId;
          return (
            <li key={question.id} className={isCorrect ? "correct" : "incorrect"}>
              <details open={!isCorrect || index === 0}>
                <summary>
                  <span className="answer-status">{isCorrect ? <CheckIcon /> : <CloseIcon />}</span>
                  <span className="answer-index">{index + 1}</span>
                  <strong>{question.prompt}</strong>
                  <span className="answer-label">{isCorrect ? "Correct" : "Needs review"}</span>
                </summary>
                <div className="answer-details">
                  <div><span>Your answer</span><strong>{selected?.text}</strong></div>
                  {!isCorrect ? <div><span>Correct answer</span><strong>{correct?.text}</strong></div> : null}
                  <div><span>Explanation</span><p>{question.explanation}</p></div>
                  <div><span>Reference</span><strong className="reference-text">Section {question.section} · p. {question.page}</strong></div>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
