"use client";

import { useState } from "react";
import { MoonStar, Utensils, Activity } from "lucide-react";
import "./teaser2-features.css";

const weeks = [
  { label: "This week", dates: "Sep 14–20", sleep: "7h 42m", points: [64, 58, 66, 42, 45, 29, 34], skin: [70, 61, 66, 53, 48, 39, 44] },
  { label: "Last week", dates: "Sep 7–13", sleep: "7h 08m", points: [72, 64, 76, 53, 64, 49, 58], skin: [76, 70, 68, 71, 59, 62, 55] },
];

export function Teaser2Features() {
  const [week, setWeek] = useState(0);
  const data = weeks[week];
  return <div className="t2-features skin-shell">
    <section className="t2-feature" aria-labelledby="t2-index-title">
      <div className="t2-feature-copy"><p className="t2-eyebrow">01 / THE BIG PICTURE</p><h2 id="t2-index-title">Your skin wellness,<br /><em>at a glance.</em></h2><p>Sleep, stress insights, and the habits you log—brought together in your Skin Balance Index.</p></div>
      <figure className="t2-composition">
        <div className="t2-glass t2-score-card"><p className="t2-label">SKIN BALANCE INDEX</p><div className="t2-score"><span>82</span><span>/ 100</span></div><span className="t2-balanced"><i aria-hidden="true" />Balanced</span><div className="t2-track" role="meter" aria-label="Illustrative Skin Balance Index" aria-valuemin={0} aria-valuemax={100} aria-valuenow={82}><span /></div></div>
        <figcaption>Illustrative product preview</figcaption>
      </figure>
    </section>
    <section className="t2-feature t2-feature-reverse" aria-labelledby="t2-inputs-title">
      <div className="t2-feature-copy"><p className="t2-eyebrow">02 / A LITTLE MORE CONTEXT</p><h2 id="t2-inputs-title">Three inputs.<br /><em>Room for the details.</em></h2><p>See your sleep, explore stress-related insights, and keep the food notes you choose to log. Each adds a different piece of your day.</p></div>
      <figure className="t2-composition">
        <div className="t2-input-cards">
          <div className="t2-glass t2-input-card"><div className="t2-input-heading"><MoonStar size={18} aria-hidden="true" /><strong>Sleep</strong><span>Overnight</span></div><div className="t2-input-value">7h 42m <span>Total sleep</span></div><div className="t2-sleep-bars" aria-hidden="true">{[12,21,16,27,34,25,16,29,35,23,18,27,19,13,23,16,12,20,14,10].map((height,i)=><i key={i} style={{height}} />)}</div><p>Estimated from ring signals</p></div>
          <div className="t2-glass t2-input-card"><div className="t2-input-heading"><Utensils size={18} aria-hidden="true" /><strong>Food</strong><span>Logged by you</span></div><div className="t2-food-note"><span>12:30</span><span>Lunch<br /><strong>Grain bowl, greens & avocado</strong></span></div><p>Your notes. No automatic food detection.</p></div>
          <div className="t2-glass t2-input-card"><div className="t2-input-heading"><Activity size={18} aria-hidden="true" /><strong>Stress</strong><span>Daily context</span></div><div className="t2-input-value t2-stress-value">A quieter afternoon</div><svg viewBox="0 0 280 35" aria-hidden="true"><path d="M2 23 Q15 23 22 18 T45 20 T64 9 T84 16 T103 11 T125 23 T147 21 T167 25 T189 22 T210 24 T233 21 T256 23 T278 22" /></svg><p>Physiological context, not a reading of your mood</p></div>
        </div><figcaption>Example records and insights</figcaption>
      </figure>
    </section>
    <section className="t2-feature" aria-labelledby="t2-patterns-title">
      <div className="t2-feature-copy"><p className="t2-eyebrow">03 / YOUR RECORDS, TOGETHER</p><h2 id="t2-patterns-title">Notice what changes.<br /><em>And what repeats.</em></h2><p>Explore your routine records alongside your skin check-ins over time. A little perspective can help you spot patterns worth paying attention to.</p></div>
      <figure className="t2-composition">
        <div className="t2-glass t2-history-card"><div className="t2-history-heading"><span className="t2-label">YOUR WEEK, TOGETHER</span><span>{data.dates}</span></div>
          <div className="t2-period" role="group" aria-label="Example record period">{weeks.map((item,i)=><button key={item.label} type="button" aria-pressed={week===i} onClick={()=>setWeek(i)}>{item.label}</button>)}</div>
          <div className="t2-legend"><span><i />Sleep consistency</span><span><i />Skin comfort</span></div>
          <svg className="t2-chart" viewBox="0 0 300 110" role="img" aria-label={`${data.label}: illustrative sleep consistency and self-reported skin comfort trends. Separate relative scales; not a causal relationship.`}>
            {[25,55,85].map(y=><line key={y} x1="12" x2="288" y1={y} y2={y} className="t2-gridline" />)}
            <polyline points={data.points.map((y,i)=>`${15+i*45},${y}`).join(' ')} className="t2-sleep-line" />
            <polyline points={data.skin.map((y,i)=>`${15+i*45},${y}`).join(' ')} className="t2-skin-line" />
            {data.skin.map((y,i)=><circle key={i} cx={15+i*45} cy={y} r="3" className="t2-skin-dot" />)}
            {['M','T','W','T','F','S','S'].map((d,i)=><text key={i} x={15+i*45} y="106" textAnchor="middle">{d}</text>)}
          </svg><p className="t2-chart-note">Relative trends · separate scales</p>
          <div className="t2-week-summary" aria-live="polite"><div><span>Average sleep</span><strong>{data.sleep}</strong></div><div><span>Skin check-ins</span><strong>7 <small>/ 7 days</small></strong></div></div>
          <p className="t2-history-note">Patterns invite a closer look.<br />They don’t explain the cause.</p>
        </div><figcaption>Illustrative records · not live health data</figcaption>
      </figure>
    </section>
  </div>;
}
