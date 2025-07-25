import React from "react";

interface ToggleProps {
  question: string;
  answer: string;
}

const Toggle: React.FC<ToggleProps> = ({ question, answer }) => {
  return (
    <details>
      <summary>{question}</summary>
      <div>{answer}</div>
    </details>
  );
};

export default Toggle;
