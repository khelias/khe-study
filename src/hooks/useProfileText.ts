const DISPLAY_LOCALE = 'et-EE';
const PRESERVED_UPPERCASE = new Set(['OK']);

/**
 * Returns a text-formatting helper used to humanize uppercase strings coming
 * from generators and translation tables. Retained as a hook (not a free
 * function) so existing call sites continue working without churn.
 */
export const useProfileText = () => {
  const formatText = (text: string): string => {
    if (!text) return text;
    if (PRESERVED_UPPERCASE.has(text)) return text;

    const upper = text.toLocaleUpperCase(DISPLAY_LOCALE);
    const lower = text.toLocaleLowerCase(DISPLAY_LOCALE);
    const hasCasedLetters = upper !== lower;
    if (hasCasedLetters && text === upper) {
      return lower.replace(
        /^([\s"'([{]*)(\p{L})/u,
        (_match, prefix: string, firstLetter: string) =>
          `${prefix}${firstLetter.toLocaleUpperCase(DISPLAY_LOCALE)}`,
      );
    }
    return text;
  };

  return { formatText };
};
