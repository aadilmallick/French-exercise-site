import BrowserOnly from "@docusaurus/BrowserOnly";
import React, { useState, useRef, useEffect } from "react";
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

function getStorage(lessonName: string) {
  return new LocalStorageBrowser<{
    completed: boolean;
  }>(lessonName);
}

type LessonCompletedPillProps = {
  lessonName: string;
  className?: string;
};

const CHECK_SVG = (
  <span className="pill-check" aria-hidden="true">
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="10" fill="#22c55e" />
      <path
        d="M6 10.5L9 13.5L14 7.5"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

export default function LessonCompletedPill({
  lessonName,
  className = "",
}: LessonCompletedPillProps) {
  const [completed, setCompleted] = useState(false);
  const storage = getStorage(lessonName);

  useEffect(() => {
    const stored = storage.get("completed");
    setCompleted(!!stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonName]);

  const handleToggle = () => {
    const newStatus = !completed;
    setCompleted(newStatus);
    storage.set("completed", newStatus);
  };

  return (
    <button
      type="button"
      className={`lesson-completed-pill${
        completed ? " completed" : ""
      } ${className}`.trim()}
      onClick={handleToggle}
      aria-pressed={completed}
    >
      {completed ? <>Lesson Completed {CHECK_SVG}</> : "Mark done"}
    </button>
  );
}
