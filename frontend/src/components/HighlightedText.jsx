// Renders the analysed description with the words returned by the API
// highlighted. Tokenisation mirrors scikit-learn's default TF-IDF pattern
// (\b\w\w+\b, lower-cased) so highlighted words match the model's features.
function HighlightedText({ text, positiveWords = [], negativeWords = [] }) {
  const positive = new Map(positiveWords.map((w) => [w.word.toLowerCase(), w.contribution]));
  const negative = new Map(negativeWords.map((w) => [w.word.toLowerCase(), w.contribution]));
  const parts = text.split(/(\b\w\w+\b)/u);

  return (
    <p className="highlighted-text">
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        const key = part.toLowerCase();
        if (positive.has(key)) {
          return (
            <mark key={i} className="hl pos" title={`Supports · ${positive.get(key).toFixed(4)}`}>
              {part}
            </mark>
          );
        }
        if (negative.has(key)) {
          return (
            <mark key={i} className="hl neg" title={`Opposes · ${negative.get(key).toFixed(4)}`}>
              {part}
            </mark>
          );
        }
        return part;
      })}
    </p>
  );
}

export default HighlightedText;
