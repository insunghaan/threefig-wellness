/** An editorial flow diagram: three daily signals meet, continue as one. */
export function PatternPreview() {
  return (
    <figure className="skin-pattern-concept">
      <svg className="skin-pattern-drawing" viewBox="0 0 560 480" role="img" aria-labelledby="pattern-concept-title pattern-concept-description">
        <title id="pattern-concept-title">Three signals, one clearer direction</title>
        <desc id="pattern-concept-description">Sleep, food and stress follow separate paths that merge into one straight line that ends at a bright white circle.</desc>
        <defs>
          <linearGradient id="pattern-sleep" x1="120" y1="110" x2="350" y2="240" gradientUnits="userSpaceOnUse"><stop stopColor="#baacd0" stopOpacity=".35" /><stop offset="1" stopColor="#9b83b5" /></linearGradient>
          <linearGradient id="pattern-food" x1="120" y1="240" x2="350" y2="240" gradientUnits="userSpaceOnUse"><stop stopColor="#d9b3be" stopOpacity=".4" /><stop offset="1" stopColor="#b997bf" /></linearGradient>
          <linearGradient id="pattern-stress" x1="120" y1="370" x2="350" y2="240" gradientUnits="userSpaceOnUse"><stop stopColor="#adb9d5" stopOpacity=".35" /><stop offset="1" stopColor="#9b83b5" /></linearGradient>
          <linearGradient id="pattern-direction" x1="350" y1="240" x2="510" y2="240" gradientUnits="userSpaceOnUse"><stop stopColor="#9b83b5" /><stop offset="1" stopColor="#695076" /></linearGradient>
          <radialGradient id="pattern-light"><stop stopColor="#fefaff" /><stop offset=".3" stopColor="#dfcfe9" stopOpacity=".5" /><stop offset="1" stopColor="#dbcce7" stopOpacity="0" /></radialGradient>
          <linearGradient id="pattern-light-edge" x1="460" y1="0" x2="560" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="white" /><stop offset="1" stopColor="black" /></linearGradient>
          <mask id="pattern-light-mask" x="0" y="0" width="560" height="480" maskUnits="userSpaceOnUse"><rect width="560" height="480" fill="url(#pattern-light-edge)" /></mask>
          <filter id="pattern-soft-light" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        <ellipse cx="510" cy="240" rx="180" ry="170" fill="url(#pattern-light)" mask="url(#pattern-light-mask)" />
        <g fill="none" strokeWidth="1.7" strokeLinecap="round">
          <path d="M120 110 Q230 240 350 240" stroke="url(#pattern-sleep)" />
          <path d="M120 240 H350" stroke="url(#pattern-food)" />
          <path d="M120 370 Q230 240 350 240" stroke="url(#pattern-stress)" />
          <path d="M350 240 H510" stroke="url(#pattern-direction)" />
        </g>
        <g fill="#f8f7f8" strokeWidth="1.5">
          <circle cx="120" cy="110" r="6" stroke="#b5a3c9" />
          <circle cx="120" cy="240" r="6" stroke="#c49eae" />
          <circle cx="120" cy="370" r="6" stroke="#a8b2ce" />
        </g>
        <circle cx="510" cy="240" r="19" fill="#fefcff" filter="url(#pattern-soft-light)" />
        <circle cx="510" cy="240" r="8" fill="#fff" stroke="#b49bc5" strokeWidth="1.5" />
      </svg>
      <span className="skin-pattern-label skin-pattern-label-sleep">Sleep</span>
      <span className="skin-pattern-label skin-pattern-label-food">Food</span>
      <span className="skin-pattern-label skin-pattern-label-stress">Stress</span>
      <figcaption>Three signals.<br /><em>A clearer direction.</em></figcaption>
    </figure>
  );
}
