import BrowserOnly from "@docusaurus/BrowserOnly";
import React, { useState, useRef, useEffect } from "react";
import a15TimeExercise from "../../data/exercises/a1-5-time-exercise.json";

interface Question {
  type: "multiple_choice" | "fill_in_blank" | "multi_select" | "free_response";
  question: string;
  options: string[];
  correctAnswers: string[];
  explanation: string;
}

interface QuizProps {
  questions: Question[];
  title: string;
  exerciseName: string;
}

interface UserAnswer {
  questionIndex: number;
  answer: string | string[];
  isCorrect: boolean;
  explanation: string;
}

interface QuizProgress {
  lastAttempt: Date;
  bestScore: number;
  totalAttempts: number;
  averageScore: number;
  lastAnswers: UserAnswer[];
  lastAttemptAnswers: (string | string[])[];
  lastAttemptDate: string;
}

export class LocalStorageBrowser<T extends Record<string, any>> {
  constructor(private prefix: string = "") {}

  private getKey(key: keyof T & string): string {
    return this.prefix + key;
  }

  public set<K extends keyof T & string>(key: K, value: T[K]): void {
    window.localStorage.setItem(this.getKey(key), JSON.stringify(value));
  }

  public get<K extends keyof T & string>(key: K): T[K] | null {
    const item = window.localStorage.getItem(this.getKey(key));
    return item ? JSON.parse(item) : null;
  }

  public removeItem(key: keyof T & string): void {
    window.localStorage.removeItem(this.getKey(key));
  }

  public clear(): void {
    window.localStorage.clear();
  }
}

function getStorage(exerciseName: string) {
  return new LocalStorageBrowser<{
    questions: Question[];
    progress: QuizProgress;
  }>(exerciseName);
}

const QuizComponent: React.FC<QuizProps> = ({
  questions,
  title,
  exerciseName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<(string | string[])[]>(
    []
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [showReview, setShowReview] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const storage = getStorage(exerciseName);

  useEffect(() => {
    // Initialize answers array
    setCurrentAnswers(new Array(questions.length).fill(""));

    // Load previous progress
    const savedProgress = storage.get("progress");
    if (savedProgress) {
      setProgress(savedProgress);
    }
  }, [questions]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsSubmitted(false);
    setShowReview(false);
    setCurrentAnswers(new Array(questions.length).fill(""));
    setUserAnswers([]);
    setScore(0);
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowReview(false);
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  const handleAnswerChange = (
    questionIndex: number,
    answer: string | string[]
  ) => {
    const newAnswers = [...currentAnswers];
    newAnswers[questionIndex] = answer;
    setCurrentAnswers(newAnswers);
  };

  const validateAnswer = (
    question: Question,
    answer: string | string[]
  ): boolean => {
    switch (question.type) {
      case "multiple_choice":
      case "fill_in_blank":
        return question.correctAnswers.includes(answer as string);
      case "multi_select":
        const answerArray = answer as string[];
        return (
          answerArray.length === question.correctAnswers.length &&
          question.correctAnswers.every((correct) =>
            answerArray.includes(correct)
          )
        );
      case "free_response":
        // For free response, we'll do a case-insensitive comparison
        return question.correctAnswers.some(
          (correct) =>
            (answer as string).toLowerCase().trim() ===
            correct.toLowerCase().trim()
        );
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    const answers: UserAnswer[] = [];
    let correctCount = 0;

    questions.forEach((question, index) => {
      const answer = currentAnswers[index];
      const isCorrect = validateAnswer(question, answer);
      if (isCorrect) correctCount++;

      answers.push({
        questionIndex: index,
        answer,
        isCorrect,
        explanation: question.explanation,
      });
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setUserAnswers(answers);
    setIsSubmitted(true);

    // Save progress with last attempt details
    const newProgress: QuizProgress = {
      lastAttempt: new Date(),
      bestScore: progress
        ? Math.max(progress.bestScore, finalScore)
        : finalScore,
      totalAttempts: progress ? progress.totalAttempts + 1 : 1,
      averageScore: progress
        ? Math.round(
            (progress.averageScore * progress.totalAttempts + finalScore) /
              (progress.totalAttempts + 1)
          )
        : finalScore,
      lastAnswers: answers,
      lastAttemptAnswers: [...currentAnswers],
      lastAttemptDate: new Date().toLocaleDateString(),
    };

    setProgress(newProgress);
    storage.set("progress", newProgress);
  };

  const handleReviewLastAttempt = () => {
    if (progress?.lastAttemptAnswers) {
      setCurrentAnswers(progress.lastAttemptAnswers);
      setUserAnswers(progress.lastAnswers);
      setScore(
        (progress.lastAnswers.filter((a) => a.isCorrect).length /
          questions.length) *
          100
      );
      setIsSubmitted(true);
      setShowReview(true);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const answer = currentAnswers[index];
    const userAnswer = userAnswers[index];

    return (
      <div
        key={index}
        className={`question-container ${
          userAnswer ? (userAnswer.isCorrect ? "correct" : "incorrect") : ""
        }`}
      >
        <h3 className="question-title">
          Question {index + 1}: {question.question}
        </h3>

        <div className="question-content">
          {question.type === "multiple_choice" && (
            <div className="options-container">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="radio-option">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    disabled={isSubmitted}
                    required
                  />
                  <span className="radio-custom"></span>
                  {option}
                </label>
              ))}
            </div>
          )}

          {question.type === "fill_in_blank" && (
            <select
              value={answer as string}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              disabled={isSubmitted}
              className="fill-blank-select"
              required
            >
              <option value="">Select an answer...</option>
              {question.options.map((option, optionIndex) => (
                <option key={optionIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          {question.type === "multi_select" && (
            <div className="options-container">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="checkbox-option">
                  <input
                    type="checkbox"
                    value={option}
                    required
                    checked={((answer as string[]) || []).includes(option)}
                    onChange={(e) => {
                      const currentArray = (answer as string[]) || [];
                      const newArray = e.target.checked
                        ? [...currentArray, option]
                        : currentArray.filter((item) => item !== option);
                      handleAnswerChange(index, newArray);
                    }}
                    disabled={isSubmitted}
                  />
                  <span className="checkbox-custom"></span>
                  {option}
                </label>
              ))}
            </div>
          )}

          {question.type === "free_response" && (
            <input
              type="text"
              value={answer as string}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              disabled={isSubmitted}
              className="free-response-input"
              placeholder="Type your answer here..."
            />
          )}
        </div>

        {userAnswer && (
          <div
            className={`explanation ${
              userAnswer.isCorrect
                ? "correct-explanation"
                : "incorrect-explanation"
            }`}
          >
            <div className="result-indicator">
              {userAnswer.isCorrect ? "✅ Correct!" : "❌ Incorrect"}
            </div>
            <div className="explanation-text">
              <strong>Explanation:</strong> {userAnswer.explanation}
            </div>
            {!userAnswer.isCorrect && (
              <div className="correct-answer">
                <strong>Correct answer(s):</strong>{" "}
                {question.correctAnswers.join(", ")}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <button onClick={handleOpen} className="quiz-button">
        {progress
          ? `Take Quiz Again (Best: ${progress.bestScore}%)`
          : "Start Quiz"}
      </button>

      <dialog ref={dialogRef} className="quiz-dialog">
        <div className="quiz-container">
          <div className="quiz-header">
            <h2>{title}</h2>
            <button onClick={handleClose} className="close-button">
              ×
            </button>
          </div>

          {progress && (
            <div className="progress-summary">
              <div className="progress-item">
                <span>Best Score:</span> <strong>{progress.bestScore}%</strong>
              </div>
              <div className="progress-item">
                <span>Attempts:</span> <strong>{progress.totalAttempts}</strong>
              </div>
              <div className="progress-item">
                <span>Average:</span> <strong>{progress.averageScore}%</strong>
              </div>
              {progress.lastAttemptDate && (
                <div className="progress-item">
                  <span>Last Attempt:</span>{" "}
                  <strong>{progress.lastAttemptDate}</strong>
                </div>
              )}
            </div>
          )}

          {!isSubmitted ? (
            <>
              <div className="questions-container">
                {questions.map((question, index) =>
                  renderQuestion(question, index)
                )}
              </div>

              <div className="quiz-actions">
                <button onClick={handleSubmit} className="submit-button">
                  Submit Quiz
                </button>
                {progress?.lastAttemptAnswers && (
                  <button
                    onClick={handleReviewLastAttempt}
                    className="review-button"
                  >
                    Review Last Attempt
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="results-container">
              <div className="score-display">
                <h3>{showReview ? "Last Attempt Review" : "Quiz Results"}</h3>
                <div
                  className={`score ${
                    score >= 80
                      ? "excellent"
                      : score >= 60
                      ? "good"
                      : "needs-improvement"
                  }`}
                >
                  {Math.round(score)}%
                </div>
                <p className="score-message">
                  {score >= 80
                    ? "Excellent work!"
                    : score >= 60
                    ? "Good job! Keep practicing."
                    : "Keep studying and try again!"}
                </p>
                {showReview && progress?.lastAttemptDate && (
                  <p className="attempt-date">
                    Attempt from: {progress.lastAttemptDate}
                  </p>
                )}
              </div>

              <div className="questions-container">
                {questions.map((question, index) =>
                  renderQuestion(question, index)
                )}
              </div>

              <div className="quiz-actions">
                <button onClick={handleClose} className="close-results-button">
                  Close
                </button>
                {!showReview && (
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setCurrentAnswers(new Array(questions.length).fill(""));
                      setUserAnswers([]);
                    }}
                    className="retry-button"
                  >
                    Try Again
                  </button>
                )}
                {showReview && (
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setShowReview(false);
                      setCurrentAnswers(new Array(questions.length).fill(""));
                      setUserAnswers([]);
                    }}
                    className="retry-button"
                  >
                    Take New Quiz
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
};

const quizPropMap = {
  "telling-time": {
    title: "Telling Time",
    exerciseName: "telling-time",
    questions: a15TimeExercise as Question[],
  },
};

// Wrap the component with BrowserOnly to ensure it only renders on the client
const Quiz: React.FC<{ exerciseName: keyof typeof quizPropMap }> = ({
  exerciseName,
}) => {
  const props = quizPropMap[exerciseName];
  if (!props) {
    throw new Error(`No props found for exercise ${exerciseName}`);
  }
  return <BrowserOnly>{() => <QuizComponent {...props} />}</BrowserOnly>;
};

export default Quiz;
