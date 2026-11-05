import { ChevronDown, Maximize2 } from "lucide-react";
import { useId, useRef } from "react";
import { SPLITS } from "../data/researchResults";

export function SplitBadge({ split }) {
  if (split === "cv") {
    return <span className="split-badge cv">Cross-validation · training data</span>;
  }

  const info = SPLITS[split];

  return (
    <span className={`split-badge ${split}`}>
      {info.label} set · {info.samples} texts
    </span>
  );
}

export function SourceNote({ children }) {
  return (
    <p className="source-note">
      Source <code>{children}</code>
    </p>
  );
}

export function SegmentedControl({ options, value, onChange, label, size }) {
  return (
    <div
      className={size === "lg" ? "segmented lg" : "segmented"}
      role="group"
      aria-label={label}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={active ? "active" : ""}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {Icon && <Icon size={16} aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// Accessible tabs (WAI-ARIA pattern) with arrow-key navigation.
export function Tabs({ tabs, value, onChange, label }) {
  const baseId = useId();
  const refs = useRef([]);
  const index = tabs.findIndex((tab) => tab.value === value);

  const onKeyDown = (event) => {
    const keys = { ArrowRight: 1, ArrowLeft: -1 };
    let next = null;
    if (event.key in keys) next = (index + keys[event.key] + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  };

  return (
    <>
      <div className="tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const selected = tab.value === value;
          return (
            <button
              key={tab.value}
              ref={(el) => (refs.current[i] = el)}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.value}`}
              tabIndex={selected ? 0 : -1}
              className={selected ? "tab active" : "tab"}
              onClick={() => onChange(tab.value)}
            >
              {Icon && <Icon size={17} aria-hidden="true" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {tabs.map((tab) =>
        tab.value === value ? (
          <div
            key={tab.value}
            role="tabpanel"
            id={`${baseId}-panel-${tab.value}`}
            aria-labelledby={`${baseId}-tab-${tab.value}`}
            className="tab-panel"
            tabIndex={0}
          >
            {tab.content}
          </div>
        ) : null
      )}
    </>
  );
}

export function Disclosure({ title, subtitle, icon: Icon, children, className = "", defaultOpen = false }) {
  return (
    <details className={`disclosure ${className}`} open={defaultOpen}>
      <summary>
        {Icon && (
          <span className="disclosure-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        )}
        <span className="disclosure-title">
          {title}
          {subtitle && <small>{subtitle}</small>}
        </span>
        <ChevronDown className="disclosure-chevron" size={18} aria-hidden="true" />
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}

export function Figure({ src, alt, caption, source }) {
  return (
    <figure className="figure">
      <a href={src} target="_blank" rel="noreferrer" className="figure-frame">
        <img src={src} alt={alt} loading="lazy" />
        <span className="figure-zoom" aria-hidden="true">
          <Maximize2 size={14} /> Open full size
        </span>
      </a>
      <figcaption>
        {caption}
        {source && <span className="figure-source"> {source}</span>}
      </figcaption>
    </figure>
  );
}

export function Eyebrow({ children, inverse = false }) {
  return <span className={inverse ? "eyebrow inverse" : "eyebrow"}>{children}</span>;
}
