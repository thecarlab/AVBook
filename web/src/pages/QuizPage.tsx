import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { ArrowIcon, BookIcon, CheckIcon, CloseIcon } from "../components/Icons";
import { createQuizAttempt } from "../data/quizBank";
import { loadQuestionBank } from "../data/questions";
import { completeChapter } from "../lib/progress";
import type { Chapter, QuizQuestion, QuizStimulus } from "../types";

interface QuizPageProps {
  chapter: Chapter;
}

export function QuizPage({ chapter }: QuizPageProps) {
  const [bank, setBank] = useState<QuizQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setBank(null);
    setLoadError(null);
    loadQuestionBank(chapter.id)
      .then((questions) => { if (active) setBank(questions); })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Unknown quiz-loading error");
      });
    return () => { active = false; };
  }, [chapter.id, loadAttempt]);

  return (
    <div className="site-shell quiz-shell">
      <AppHeader compact chapterId={chapter.id} />
      <main id="main-content" className="quiz-main">
        {bank ? <QuizSession key={`${chapter.id}-${loadAttempt}`} chapter={chapter} bank={bank} /> : (
          <div className="quiz-bank-state" role={loadError ? "alert" : "status"}>
            <span className={loadError ? "error" : "loading"} />
            <h1>{loadError ? "The quiz could not be prepared" : "Preparing this chapter’s cases…"}</h1>
            <p>{loadError ?? "Loading only this chapter’s 100-question assessment bank."}</p>
            {loadError ? <button className="button button-dark" type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Try loading again</button> : null}
          </div>
        )}
      </main>
    </div>
  );
}

function QuizSession({ chapter, bank }: QuizPageProps & { bank: QuizQuestion[] }) {
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

  return submitted ? (
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
          <p>Ten questions selected from a 100-question bank: two each for application, diagnosis, comparison, causal reasoning, and transfer. Results and reasoning appear after submission.</p>
        </div>
        <span className="quiz-position">{current + 1} / 10</span>
      </header>
      <div className="quiz-progress-track" aria-hidden="true"><span style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
      <fieldset className="question-card">
        <legend><span>Question {current + 1}{question.skill ? ` · ${formatSkill(question.skill)}` : ""}</span>{question.prompt}</legend>
        {question.stimulus ? <QuizStimulusView stimulus={question.stimulus} /> : null}
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
    ? "Excellent — every reasoning case in this set is secure."
    : score >= 7
      ? `Great work — review ${10 - score === 1 ? "the one case" : `the ${10 - score} cases`} below, then try a fresh set.`
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
        <small>10 of 100 questions · balanced across five reasoning skills</small>
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
                  {question.stimulus ? <div className="answer-stimulus"><QuizStimulusView stimulus={question.stimulus} compact /></div> : null}
                  <div><span>Your answer</span><strong>{selected?.text}</strong></div>
                  {!isCorrect ? <div><span>Correct answer</span><strong>{correct?.text}</strong></div> : null}
                  {selected?.feedback ? <div><span>Why your choice works or fails</span><p>{selected.feedback}</p></div> : null}
                  <div><span>Reasoning</span>{question.reasoning ? <ol>{question.reasoning.map((step) => <li key={step}>{step}</li>)}</ol> : <p>{question.explanation}</p>}{question.takeaway ? <p className="answer-takeaway"><strong>Takeaway:</strong> {question.takeaway}</p> : null}</div>
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

function QuizStimulusView({ stimulus, compact = false }: { stimulus: QuizStimulus; compact?: boolean }) {
  if (stimulus.kind === "scenario") {
    return <div className={`quiz-stimulus stimulus-scenario ${compact ? "compact" : ""}`}><span>Case evidence</span><p>{stimulus.text}</p></div>;
  }
  if (stimulus.kind === "log") {
    return <figure className={`quiz-stimulus stimulus-log ${compact ? "compact" : ""}`}><figcaption>{stimulus.caption}</figcaption><pre>{stimulus.lines.join("\n")}</pre></figure>;
  }
  if (stimulus.kind === "table") {
    return <figure className={`quiz-stimulus stimulus-table ${compact ? "compact" : ""}`}><figcaption>{stimulus.caption}</figcaption><div><table><thead><tr>{stimulus.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{stimulus.rows.map((row, rowIndex) => <tr key={`${rowIndex}-${row.join("-")}`}>{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cell}</td>)}</tr>)}</tbody></table></div></figure>;
  }
  return <figure className={`quiz-stimulus stimulus-image ${compact ? "compact" : ""}`}><img src={stimulus.src} alt={stimulus.alt} /><figcaption>{stimulus.caption}</figcaption></figure>;
}

function formatSkill(skill: string) {
  return skill === "causal" ? "causal reasoning" : skill;
}
