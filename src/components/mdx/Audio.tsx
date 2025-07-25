import React from "react";

interface AudioProps {
  src: string;
  type: "mp3" | "wav";
}

const Audio: React.FC<AudioProps> = ({ src, type = "mp3" }) => {
  return (
    <audio controls crossOrigin="anonymous" preload="metadata">
      <source src={src} type={`audio/${type}`} />
      Your browser does not support the audio element.
    </audio>
  );
};

export default Audio;
