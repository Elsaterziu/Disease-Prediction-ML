// Mark: a text line where one word is "lit up", the product's core idea
// of reading a description and highlighting what matters.
export function LogoMark({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="logo-mark"
    >
      <rect width="32" height="32" rx="9" fill="var(--dark-900)" />
      <rect x="7" y="9.5" width="18" height="2.6" rx="1.3" fill="#3b6a61" />
      <rect x="7" y="14.7" width="6" height="2.6" rx="1.3" fill="#3b6a61" />
      <rect x="15" y="13.6" width="10" height="4.8" rx="2.4" fill="var(--accent-400)" />
      <rect x="7" y="19.9" width="12" height="2.6" rx="1.3" fill="#3b6a61" />
    </svg>
  );
}

function Logo({ inverse = false }) {
  return (
    <span className={inverse ? "logo inverse" : "logo"}>
      <LogoMark />
      <span className="logo-word">
        Symptom<span className="logo-two">2</span>Disease
      </span>
    </span>
  );
}

export default Logo;
