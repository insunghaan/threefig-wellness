"use client";

import React, { useState } from "react";
import { Moon, Activity, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export function Teaser4MeetIntro() {
  const [activeTab, setActiveTab] = useState<"overview" | "signals" | "impact">("overview");

  return (
    <section
      id="meet-3fig"
      className="teaser4-section teaser4-meet-section"
      aria-labelledby="meet-title"
    >
      <div className="teaser4-meet-container">
        {/* Header Block: Direct, Punchy US-style messaging */}
        <div className="teaser4-meet-header">
          <p className="teaser4-eyebrow">THE 3FIG SCIENCE ENGINE</p>
          <h2 id="meet-title" className="teaser4-meet-title">
            The smart ring that measures <br />
            <span className="teaser4-rose-accent">what really drives your skin.</span>
          </h2>
          <p className="teaser4-meet-desc">
            Your skin reflects internal physiological recovery before irritation ever surfaces. 
            3fig tracks overnight biosignals directly from your finger to deliver daily, actionable skin intelligence.
          </p>
        </div>

        {/* Professional High-Precision App Interface & Ring Showcase */}
        <div className="teaser4-meet-app-showcase">
          <div className="teaser4-showcase-card">
            {/* Top Device & App Status Bar */}
            <div className="teaser4-app-topbar">
              <div className="teaser4-app-topbar-device">
                <span className="teaser4-device-pulse" />
                <span className="teaser4-device-text">3FIG RING ACTIVE · OVERNIGHT SYNC COMPLETE</span>
              </div>
              <span className="teaser4-app-time">8:30 AM</span>
            </div>

            {/* Central Precision App Display */}
            <div className="teaser4-app-main-grid">
              {/* Left Column: Skin Balance Index */}
              <div className="teaser4-app-metric-col">
                <div className="teaser4-metric-head">
                  <span className="teaser4-metric-tag">TODAY&apos;S METRIC</span>
                  <span className="teaser4-metric-state">Optimal Barrier</span>
                </div>
                
                <div className="teaser4-score-display">
                  <span className="teaser4-score-num">86</span>
                  <div className="teaser4-score-meta">
                    <span className="teaser4-score-label">Skin Balance Index</span>
                    <span className="teaser4-score-sub">+4 pts vs 7-day average</span>
                  </div>
                </div>

                <div className="teaser4-progress-line">
                  <div className="teaser4-progress-fill" style={{ width: "86%" }} />
                </div>

                {/* Micro Sensor Breakdown */}
                <div className="teaser4-sensor-tags">
                  <div className="teaser4-sensor-tag">
                    <Moon size={13} className="teaser4-sensor-icon text-blue-500" />
                    <span>Deep Sleep: <strong>1h 48m</strong></span>
                  </div>
                  <div className="teaser4-sensor-tag">
                    <Activity size={13} className="teaser4-sensor-icon text-coral-500" />
                    <span>Skin Temp: <strong>-0.2°F (Stable)</strong></span>
                  </div>
                  <div className="teaser4-sensor-tag">
                    <Zap size={13} className="teaser4-sensor-icon text-emerald-500" />
                    <span>HRV Recovery: <strong>68ms</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Predictive Skin Correlation */}
              <div className="teaser4-app-correlation-col">
                <div className="teaser4-correlation-head">
                  <span className="teaser4-correlation-kicker">EPIDERMAL RECOVERY CORRELATION</span>
                  <span className="teaser4-correlation-badge">HIGH CONFIDENCE</span>
                </div>

                <div className="teaser4-insight-card">
                  <p className="teaser4-insight-statement">
                    <strong>Optimal overnight recovery detected.</strong> Your nocturnal microcirculation and temperature stability predict resilient barrier hydration today.
                  </p>
                  <div className="teaser4-insight-action">
                    <Sparkles size={14} className="teaser4-action-sparkle" />
                    <span>Suggested: Proceed with active serums today; barrier resilience is peak.</span>
                  </div>
                </div>

                {/* Sleek Vector Correlation Line (1.5px precision) */}
                <div className="teaser4-mini-chart-container">
                  <div className="teaser4-mini-chart-labels">
                    <span>Overnight Biometrics</span>
                    <span>Skin Resilience</span>
                  </div>
                  <svg viewBox="0 0 280 44" className="teaser4-mini-svg" fill="none">
                    <path
                      d="M 5,34 C 40,32 70,18 100,24 C 130,30 160,10 190,12 C 220,14 250,6 275,8"
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 5,38 C 40,36 70,26 100,28 C 130,22 160,16 190,14 C 220,10 250,8 275,6"
                      stroke="#ff6542"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                    <circle cx="275" cy="8" r="2.5" fill="#3b82f6" />
                    <circle cx="275" cy="6" r="2.5" fill="#ff6542" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Clear Mechanism: What the ring tracks ➔ How it analyzes ➔ What you see */}
        <div className="teaser4-mechanism-grid">
          <div className="teaser4-mech-card">
            <div className="teaser4-mech-num">01</div>
            <h3 className="teaser4-mech-title">Wear at Night</h3>
            <p className="teaser4-mech-text">
              Medical-grade PPG and digital temperature sensors capture deep sleep cycles, HRV, and skin temperature directly from the finger’s dense microvasculature.
            </p>
          </div>

          <div className="teaser4-mech-card">
            <div className="teaser4-mech-num">02</div>
            <h3 className="teaser4-mech-title">Correlate the Data</h3>
            <p className="teaser4-mech-text">
              The 3fig algorithm maps your physiological rest against skin barrier recovery biology, translating raw nocturnal biomarkers into your daily Skin Balance Score.
            </p>
          </div>

          <div className="teaser4-mech-card">
            <div className="teaser4-mech-num">03</div>
            <h3 className="teaser4-mech-title">Predict & Protect</h3>
            <p className="teaser4-mech-text">
              Wake up knowing exactly what your skin needs. Catch stress spikes 24 hours before breakouts or redness surface, and verify what routines actually work.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
