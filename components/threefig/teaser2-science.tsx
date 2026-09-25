"use client";

import React, { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface ScienceTopic {
  id: string;
  title: string;
  label: string;
  body: string;
  highlight: string;
  destination: string;
}

const scienceTopics: ScienceTopic[] = [
  {
    id: "sleep-skin",
    title: "Sleep & Skin",
    label: "Circadian rhythms and overnight skin barrier renewal",
    body: "Sleep is part of the environment your skin responds to. Research has linked sleep quality and sleep loss with changes in skin function, recovery, and appearance.\n\n3FIG uses supported sleep and recovery signals as context alongside your own skin check-ins.",
    highlight: "Better nights can give your skin a different context.",
    destination: "https://pubmed.ncbi.nlm.nih.gov/42641586/",
  },
  {
    id: "stress-skin",
    title: "Stress & Skin",
    label: "Autonomic response and cutaneous barrier reactivity",
    body: "Stress can influence sleep, recovery, and other physiological patterns that may coincide with changes in how skin feels.\n\n3FIG looks at supported recovery-related signals alongside your own skin check-ins to help you notice patterns over time.",
    highlight: "Stress leaves clues. Skin can be part of the story.",
    destination: "https://pubmed.ncbi.nlm.nih.gov/41962101/",
  },
  {
    id: "body-signals",
    title: "Body Signals & Skin",
    label: "Physiological baselines and long-term vitality",
    body: "Sleep, recovery, temperature trends, movement, and other supported body signals can add useful context to everyday skin changes.\n\n3FIG brings those signals together with your own skin check-ins to make personal patterns easier to notice.",
    highlight: "Your skin does not live apart from the rest of you.",
    destination: "https://pubmed.ncbi.nlm.nih.gov/42389732/",
  },
];

export function Teaser2Science() {
  const [selectedTopic, setSelectedTopic] = useState<ScienceTopic | null>(null);
  const [mainModalOpen, setMainModalOpen] = useState(false);

  return (
    <section id="science" className="teaser2-science-section" aria-labelledby="science-heading">
      <div className="teaser2-science-container">
        {/* Section Header */}
        <div className="teaser2-section-head">
          <p className="teaser2-eyebrow">SKIN KNOWS.</p>
          <h2 id="science-heading" className="teaser2-section-title">
            Here’s why.
          </h2>
          <p className="teaser2-section-lead">
            Sleep. Stress. Recovery.<br />
            Your skin doesn’t live apart from the rest of you.
          </p>
        </div>

        {/* 3 Editorial Rows (Interactive Preview Trigger) */}
        <div className="teaser2-editorial-links" role="list">
          {scienceTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className="teaser2-editorial-link-item"
              role="listitem"
              onClick={() => setSelectedTopic(topic)}
              aria-haspopup="dialog"
              aria-label={`Preview skin science topic: ${topic.title}`}
            >
              <div className="teaser2-editorial-link-text">
                <span className="teaser2-editorial-link-title">{topic.title}</span>
                <span className="teaser2-editorial-link-desc">{topic.label}</span>
              </div>
              <ArrowRight size={18} className="teaser2-editorial-arrow" aria-hidden="true" />
            </button>
          ))}
        </div>

        {/* Science Footer with Bridge Text & Explore Hub CTA */}
        <div className="teaser2-science-footer">
          <p className="teaser2-science-bridge">
            Research helps explain the connection.<br />
            Your own patterns make it personal.
          </p>
          <button
            type="button"
            className="teaser2-explore-btn"
            onClick={() => setMainModalOpen(true)}
          >
            <span>Explore Skin Science</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ============================================================
          TOPIC OVERLAY: DESKTOP EDITORIAL MODAL & MOBILE BOTTOM SHEET
          ============================================================ */}
      <Dialog
        open={Boolean(selectedTopic)}
        onOpenChange={(open) => {
          if (!open) setSelectedTopic(null);
        }}
      >
        <DialogContent
          className="teaser2-unified-dialog"
          showCloseButton={false}
        >
          {selectedTopic && (
            <div className="teaser2-dialog-content-inner">
              {/* Close Button & Eyebrow */}
              <div className="teaser2-dialog-top-bar">
                <p className="teaser2-dialog-eyebrow">SKIN SCIENCE</p>
                <button
                  type="button"
                  className="teaser2-dialog-close-btn"
                  onClick={() => setSelectedTopic(null)}
                  aria-label="Close overview"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Title */}
              <DialogTitle className="teaser2-dialog-title">
                {selectedTopic.title}
              </DialogTitle>

              {/* Short Explanatory Body */}
              <DialogDescription className="teaser2-dialog-body">
                {selectedTopic.body.split("\n\n").map((para, i) => (
                  <span key={i} className="teaser2-dialog-para">
                    {para}
                  </span>
                ))}
              </DialogDescription>

              {/* Highlight Takeaway */}
              {selectedTopic.highlight && (
                <div className="teaser2-dialog-quote-box">
                  <span className="teaser2-dialog-quote">
                    “{selectedTopic.highlight}”
                  </span>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="teaser2-dialog-actions">
                <a
                  href={selectedTopic.destination}
                  target="_blank"
                  rel="noreferrer"
                  className="teaser2-dialog-primary-btn"
                  onClick={() => setSelectedTopic(null)}
                >
                  <span>Read more</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
                <button
                  type="button"
                  className="teaser2-dialog-dismiss-btn"
                  onClick={() => setSelectedTopic(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Skin Science Hub Modal (Explore Skin Science button) */}
      <Dialog open={mainModalOpen} onOpenChange={setMainModalOpen}>
        <DialogContent className="fig-dialog teaser2-science-dialog" showCloseButton={true}>
          <DialogTitle>Skin Science &amp; Biometrics</DialogTitle>
          <DialogDescription>
            Independent dermatological and circadian research supporting the mind-body-skin axis.
          </DialogDescription>
          <div className="teaser2-science-modal-body">
            <p>
              Circadian biology shows that epidermal barrier repair, cellular proliferation, and trans-epidermal water loss undergo daily oscillation regulated by nighttime rest.
            </p>
            <p>
              When systemic recovery is suppressed, peripheral autonomic signals reflect altered skin comfort. 3FIG surfaces these correlations without medical diagnosis.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
