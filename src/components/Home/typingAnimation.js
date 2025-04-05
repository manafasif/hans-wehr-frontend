import { useState, useEffect } from "react";

const TypingAnimation = ({
  passedPlaceholder = "Search for a root like ",
  wordsToType = [
    "كتب",
    "ktb",
    "فعل",
    "fel",
    "نصر",
    "nSr",
    "ثلج",
    "vlj",
    "زلزل",
    "zlzl",
    "ظلم",
    "Zlm",
  ],
} = {}) => {
  const [wordToTypeIndex, setWordToTypeIndex] = useState(0);
  const [ticksSpentAtIndex, setTicksSpentAtIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState(passedPlaceholder.slice(0, 0));
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const TICKS_ON_COMPLETED_WORD = 3;

  useEffect(() => {
    const intr = setInterval(() => {
      setPlaceholder(
        passedPlaceholder +
          wordsToType[wordToTypeIndex].slice(0, placeholderIndex)
      );
      if (placeholderIndex + 1 > wordsToType[wordToTypeIndex].length) {
        if (ticksSpentAtIndex < TICKS_ON_COMPLETED_WORD) {
          setTicksSpentAtIndex(ticksSpentAtIndex + 1);
        } else {
          setPlaceholderIndex(0);
          setTicksSpentAtIndex(0);

          if (wordToTypeIndex >= wordsToType.length - 1) {
            // reached last word, loop around
            setWordToTypeIndex(0);
          } else {
            setWordToTypeIndex(wordToTypeIndex + 1);
          }
        }
      } else {
        setPlaceholderIndex(placeholderIndex + 1);
      }
    }, 200);
    return () => {
      clearInterval(intr);
    };
  });

  return placeholder;
};

export default TypingAnimation;
