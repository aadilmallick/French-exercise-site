import BrowserOnly from "@docusaurus/BrowserOnly";
import React, { useState, useRef, useEffect } from "react";
import a15TimeExercise from "../../data/exercises/a1-5-time-exercise.json";
import a17IrregularsExercise from "../../data/exercises/a1-7-irregulars.json";
import a17RegularPresentTenseConjugationExercise from "../../data/exercises/a1-7-regular-conjugation.json";
import a17StemChangingConjugationExercise from "../../data/exercises/a1-7-stem-changing.json";
import a18AvoirExercise from "../../data/exercises/a1-7-avoir.json";
import a10PrepositionsExercise from "../../data/exercises/a1-10-prepositions.json";
import a11AdjectivesExercise from "../../data/exercises/a1-11adjectives.json";
import a9PossessionExercise from "../../data/exercises/a1-9-possesion.json";
import a9PossessivePronounsExercise from "../../data/exercises/a-9-possessive-pronouns.json";
import a113AdverbsExercise from "../../data/exercises/a1-13adverbs.json";
import a110LocationPrepositionsExercise from "../../data/exercises/a1-10-location-prepositions.json";
import a110TimePrepositionsExercise from "../../data/exercises/a1-10-time-prepositions.json";
import a112NegationExercise from "../../data/exercises/a1-12-negation.json";
import a13AdverbsOfMannerExercise from "../../data/exercises/a13-adverbs-of-manner.json";
import a13AllAdverbTypesExercise from "../../data/exercises/a-13-alladverbtypes.json";
import a110AdvancedPrepositionsExercise from "../../data/exercises/a1-10-advanced-prepositions.json";
import a3PluralExercise from "../../data/exercises/a-3-plural.json";
import a1WeatherExercise from "../../data/exercises/a1-weather.json";
import a2NounsGenderExercise from "../../data/exercises/a-2-nounsgender.json";
import a11ArticlesExercise from "../../data/exercises/a1-1-articles.json";

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

function transformAnswer(answer: string) {
  return answer
    .replace(/[.,]+$/, "")
    .replaceAll("’", "'")
    .trim()
    .toLowerCase();
}

class LocalStorageBrowser<T extends Record<string, any>> {
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

function validateFreeResponseAnswer(correctAnswer: string, answer: string) {
  // Remove punctuation and normalize both strings
  const normalizedCorrect = correctAnswer
    .replace(/[.,]+$/, "")
    .replaceAll("’", "'")
    .trim()
    .toLowerCase();
  const normalizedAnswer = answer
    .replace(/[.,]+$/, "")
    .replaceAll("’", "'")
    .trim()
    .toLowerCase();

  return normalizedCorrect === normalizedAnswer;
}

function getStorage(exerciseName: string) {
  return new LocalStorageBrowser<{
    questions: Question[];
    progress: QuizProgress;
  }>(exerciseName);
}

function getCurrentAttemptProgressStorage(exerciseName: string) {
  return new LocalStorageBrowser<{
    currentAnswers: (string | string[])[];
  }>(`quiz-current-progress-${exerciseName}`);
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

  const getCurrentAnswersProgress = () => {
    const storage = getCurrentAttemptProgressStorage(exerciseName);
    return storage.get("currentAnswers") || [];
  };

  const setCurrentAnswersProgress = (answers: (string | string[])[]) => {
    requestIdleCallback(() => {
      const storage = getCurrentAttemptProgressStorage(exerciseName);
      storage.set("currentAnswers", answers);
    });
  };

  useEffect(() => {
    // Initialize answers array with correct types
    const currentProgressAnswers = getCurrentAnswersProgress();
    setCurrentAnswers(
      currentProgressAnswers.length > 0
        ? currentProgressAnswers
        : questions.map((q) => (q.type === "multi_select" ? [] : ""))
    );

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
    const currentProgressAnswers = getCurrentAnswersProgress();

    setCurrentAnswers(
      currentProgressAnswers.length > 0
        ? currentProgressAnswers
        : new Array(questions.length).fill("")
    );
    setUserAnswers([]);
    setScore(0);
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const handleClearCurrentAnswers = () => {
    const storage = getCurrentAttemptProgressStorage(exerciseName);
    storage.removeItem("currentAnswers");
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
    // const storage = getCurrentAttemptProgressStorage(exerciseName);
    // storage.set("currentAnswers", newAnswers);
    setCurrentAnswersProgress(newAnswers);
  };

  const shortAnswerMap = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    A: 0,
    B: 1,
    C: 2,
    D: 3,
  };

  const validateAnswer = (
    question: Question,
    answer: string | string[]
  ): boolean => {
    if (!answer) {
      return false;
    }
    switch (question.type) {
      case "multiple_choice": {
        const answerArray = typeof answer === "string" ? [answer] : answer;
        const answerChoices = ["A", "B", "C", "D", "a", "b", "c", "d"];

        // Check if ALL answers are a,b,c,d format
        const isShortAnswerFormat = question.correctAnswers.every((ans) =>
          answerChoices.includes(ans)
        );

        if (isShortAnswerFormat) {
          // const actualSelectedA
          const actualCorrectAnswers = question.correctAnswers.map((ans) =>
            answerChoices.includes(ans)
              ? question.options[shortAnswerMap[ans]]
              : ans
          );
          return (
            actualCorrectAnswers.length === answerArray.length &&
            answerArray.every((correct) =>
              actualCorrectAnswers.includes(correct)
            )
          );
        } else {
          const actualAnswer = typeof answer === "string" ? answer : answer[0];
          return question.correctAnswers.includes(actualAnswer);
        }
        // const selectedChoiceIndex = questionChoices.indexOf(selectedAnswer);
        // const correctChoiceIndex = question.correctAnswers.indexOf(
        //   questionChoices[selectedChoiceIndex]
        // );
        // return correctChoiceIndex !== -1;
      }
      case "fill_in_blank": {
        return question.correctAnswers.includes(answer as string);
      }
      case "multi_select": {
        const answerArray = answer as string[];
        const answerChoices = ["A", "B", "C", "D", "a", "b", "c", "d"];

        // Check if ALL answers are a,b,c,d format
        const isShortAnswerFormat = question.correctAnswers.every((ans) =>
          answerChoices.includes(ans)
        );

        if (isShortAnswerFormat) {
          // const actualSelectedA
          const actualCorrectAnswers = question.correctAnswers.map((ans) =>
            answerChoices.includes(ans)
              ? question.options[shortAnswerMap[ans]]
              : ans
          );
          return (
            actualCorrectAnswers.length === answerArray.length &&
            answerArray.every((correct) =>
              actualCorrectAnswers.includes(correct)
            )
          );
        } else {
          // Original logic for full text answers
          return (
            answerArray.length === question.correctAnswers.length &&
            question.correctAnswers.every((correct) =>
              answerArray.includes(correct)
            )
          );
        }
      }
      case "free_response":
        // For free response, we'll do a case-insensitive comparison
        return question.correctAnswers.some((correct) =>
          validateFreeResponseAnswer(correct, answer as string)
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
    handleClearCurrentAnswers();
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

  const FillInBlank = (question: Question, index: number, answer: string) => {
    const safeAnswer = typeof answer === "string" ? answer : "";
    if (!question.options) {
      return (
        <input
          type="text"
          value={safeAnswer}
          onChange={(e) => handleAnswerChange(index, e.target.value)}
          disabled={isSubmitted}
          className="free-response-input"
        />
      );
    }
    return (
      <select
        value={safeAnswer}
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
    );
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

          {question.type === "fill_in_blank" &&
            FillInBlank(question, index, answer as string)}

          {question.type === "multi_select" && (
            <div className="options-container">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="checkbox-option">
                  <input
                    type="checkbox"
                    value={option}
                    required
                    checked={(Array.isArray(answer) ? answer : []).includes(
                      option
                    )}
                    onChange={(e) => {
                      const currentArray = Array.isArray(answer) ? answer : [];
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
              value={typeof answer === "string" ? answer : ""}
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
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => {
                  setCurrentAnswers(new Array(questions.length).fill(""));
                  handleClearCurrentAnswers();
                }}
                className="close-button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                </svg>
              </button>
              <button onClick={handleClose} className="close-button">
                ×
              </button>
            </div>
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
                {questions?.map((question, index) =>
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
  "irregulars-present-tense-conjugation": {
    title: "Irregulars - Present Tense Conjugation",
    exerciseName: "irregulars-present-tense-conjugation",
    questions: a17IrregularsExercise as Question[],
  },
  avoir: {
    title: "Avoir",
    exerciseName: "avoir",
    questions: a18AvoirExercise as Question[],
  },
  "regular-present-tense-conjugation": {
    title: "Regular Present Tense Conjugation",
    exerciseName: "regular-present-tense-conjugation",
    questions: a17RegularPresentTenseConjugationExercise as Question[],
  },
  "stem-changing-conjugation": {
    title: "Stem Changing Conjugation",
    exerciseName: "stem-changing-conjugation",
    questions: a17StemChangingConjugationExercise as Question[],
  },
  prepositions: {
    title: "Prepositions",
    exerciseName: "prepositions",
    questions: a10PrepositionsExercise as Question[],
  },
  adjectives: {
    title: "Adjectives",
    exerciseName: "adjectives",
    questions: a11AdjectivesExercise as Question[],
  },
  possession: {
    title: "Possession",
    exerciseName: "possession",
    questions: a9PossessionExercise as Question[],
  },
  "possessive-pronouns": {
    title: "Possessive Pronouns",
    exerciseName: "possessive-pronouns",
    questions: a9PossessivePronounsExercise as Question[],
  },
  adverbs: {
    title: "Adverbs",
    exerciseName: "adverbs",
    questions: a113AdverbsExercise as Question[],
  },
  "location-prepositions": {
    title: "Location Prepositions",
    exerciseName: "location-prepositions",
    questions: a110LocationPrepositionsExercise as Question[],
  },
  "time-prepositions": {
    title: "Time Prepositions",
    exerciseName: "time-prepositions",
    questions: a110TimePrepositionsExercise as Question[],
  },
  negation: {
    title: "Negation",
    exerciseName: "negation",
    questions: a112NegationExercise as Question[],
  },
  "adverbs-of-manner": {
    title: "Adverbs of Manner",
    exerciseName: "adverbs-of-manner",
    questions: a13AdverbsOfMannerExercise as Question[],
  },
  "all-adverb-types": {
    title: "All Adverb Types",
    exerciseName: "all-adverb-types",
    questions: a13AllAdverbTypesExercise as Question[],
  },
  "advanced-prepositions": {
    title: "Advanced Prepositions",
    exerciseName: "advanced-prepositions",
    questions: a110AdvancedPrepositionsExercise as Question[],
  },
  plural: {
    title: "Plural",
    exerciseName: "plural",
    questions: a3PluralExercise as Question[],
  },
  weather: {
    title: "Weather",
    exerciseName: "weather",
    questions: a1WeatherExercise as Question[],
  },
  "nouns-gender": {
    title: "Gender of Nouns",
    exerciseName: "nouns-gender",
    questions: a2NounsGenderExercise as Question[],
  },
  articles: {
    title: "Articles",
    exerciseName: "articles",
    questions: a11ArticlesExercise as Question[],
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
