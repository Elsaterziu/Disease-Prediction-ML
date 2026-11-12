import { useLanguage } from "../i18n/languageContext";

function ContributionList({ title, words, positive }) {
  const { t } = useLanguage();
  if (!words?.length) {
    return (
      <div className="contribution-section">
        <h4>{title}</h4>
        <p className="muted small">{t("an.tech.noWords")}</p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...words.map((item) => Math.abs(item.contribution)),
    0.0001
  );

  return (
    <div className="contribution-section">
      <h4>{title}</h4>

      {words.map((item) => (
        <div className="word-row" key={item.word}>
          <div className="word-info">
            <span className="word">{item.word}</span>
            <span className="word-value">
              {item.contribution > 0 ? "+" : ""}
              {item.contribution.toFixed(4)}
            </span>
          </div>

          <div className="bar-track">
            <div
              className={positive ? "bar positive" : "bar negative"}
              style={{
                width: `${(Math.abs(item.contribution) / maxValue) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContributionList;
