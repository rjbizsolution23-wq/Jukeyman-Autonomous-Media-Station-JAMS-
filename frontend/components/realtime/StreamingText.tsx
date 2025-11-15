"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  speed?: number; // characters per tick
  className?: string;
  showCursor?: boolean;
}

export function StreamingText({
  text,
  isStreaming = false,
  speed = 2,
  className = "",
  showCursor = true,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + speed));
        setCurrentIndex(currentIndex + speed);
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [text, currentIndex, isStreaming, speed]);

  React.useEffect(() => {
    // Reset when text changes
    setCurrentIndex(0);
    setDisplayedText("");
  }, [text]);

  return (
    <div className={`relative ${className}`}>
      <span className="whitespace-pre-wrap">{displayedText}</span>
      {isStreaming && showCursor && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[2px] h-4 bg-violet-400 ml-0.5"
        />
      )}
    </div>
  );
}

interface StreamingLinesProps {
  lines: string[];
  isStreaming?: boolean;
  className?: string;
}

export function StreamingLines({ lines, isStreaming = false, className = "" }: StreamingLinesProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <AnimatePresence mode="popLayout">
        {lines.map((line, index) => (
          <motion.div
            key={`${index}-${line}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <StreamingText
              text={line}
              isStreaming={isStreaming && index === lines.length - 1}
              showCursor={index === lines.length - 1}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface TypewriterEffectProps {
  words: string[];
  className?: string;
  cursorClassName?: string;
}

export function TypewriterEffect({ words, className = "", cursorClassName = "" }: TypewriterEffectProps) {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [currentText, setCurrentText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const word = words[currentWordIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (currentText.length < word.length) {
            setCurrentText(word.slice(0, currentText.length + 1));
          } else {
            // Wait before deleting
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          // Deleting
          if (currentText.length > 0) {
            setCurrentText(currentText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentWordIndex((currentWordIndex + 1) % words.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words]);

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span>{currentText}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className={`inline-block w-[2px] h-5 bg-violet-400 ml-1 ${cursorClassName}`}
      />
    </div>
  );
}

