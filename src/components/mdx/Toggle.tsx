import React from "react";

interface ToggleProps {
  question: string;
  answer: string;
}

const Toggle: React.FC<ToggleProps> = ({ question, answer }) => {
  return (
    <details className="toggle">
      <summary>{question}</summary>
      <p className="toggle-content">{answer}</p>
    </details>
  );
};

export default Toggle;
