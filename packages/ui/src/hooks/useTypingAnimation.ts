import { useState, useEffect, useCallback } from "react";

interface UseTypingAnimationOptions {
  text: string;
  speed?: number;
  speedVariance?: number;
  startDelay?: number;
  enabled?: boolean;
}

export function useTypingAnimation({
  text,
  speed = 40,
  speedVariance = 20,
  startDelay = 0,
  enabled = true,
}: UseTypingAnimationOptions) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const reset = useCallback(() => {
    setDisplayedText("");
    setIsTyping(false);
    setIsDone(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      reset();
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    let charIndex = 0;

    const startTimeout = setTimeout(() => {
      setIsTyping(true);

      const typeNextChar = () => {
        if (charIndex < text.length) {
          setDisplayedText(text.slice(0, charIndex + 1));
          charIndex++;
          const delay = speed + (Math.random() - 0.5) * 2 * speedVariance;
          timeout = setTimeout(typeNextChar, Math.max(10, delay));
        } else {
          setIsTyping(false);
          setIsDone(true);
        }
      };

      typeNextChar();
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeout);
    };
  }, [text, speed, speedVariance, startDelay, enabled, reset]);

  return { displayedText, isTyping, isDone, reset };
}
