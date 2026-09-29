"use client";

import React, { useState, useRef } from "react";
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
  sourceName: string;
}

const scienceTopics: ScienceTopic[] = [
  {
    id: "sleep-skin",
    title: "Sleep & Skin",
    label: "Circadian rhythms and overnight skin barrier renewal",
    body: "Sleep is part of the environment your skin responds to. Research has linked sleep quality and sleep loss with changes in skin function, recovery, and appearance.\n\n3fig uses supported sleep and recovery signals as context alongside your own skin check-ins.",
    highlight: "Better nights can give your skin a different context.",
    destination: "https://pubmed.ncbi.nlm.nih.gov/42641586/",
    sourceName: "PubMed (NLM ID: 42641586)",
  },
  {
    id: "stress-skin",
    title: "Stress & Skin",
    label: "Autonomic response and cutaneous barrier reactivity",
    body: "Stress can influence sleep, recovery, and other physiological patterns that may coincide with changes in how skin feels.\n\n3fig looks at supported recovery-related signals alongside your own skin check-ins to help you notice patterns over time.",
    highlight: "Stress leaves clues. Skin can be part of the story.",
    destination: "https://pubmed.ncbi.nlm.nih.gov/41962101/",
    sourceName: "PubMed (NLM ID: 41962101)",
  },
  {
    id: "body-signals",
    title: "Body Signals & Skin",
    label: "Physiological baselines and long-term vitality",
    body: "Sleep, recovery, temperature trends, movement, and other supported body signals can add useful context to everyday skin changes.\n\n3fig brings those signals together with your own skin check-ins to make personal patterns easier to notice.",
    highlight: "Your skin does not live apart from the rest of you.",
    destination: "https://pubmed.ncbi.nlm.nih.gov/42389732/",
    sourceName: "PubMed (NLM ID: 42389732)",
  },
];

export function Teaser4ScienceSection() {
  const [selectedTopic, setSelectedTopic] = useState<ScienceTopic | null>(null);
  const [hubModalOpen, setHubModalOpen] = useState(false);
  const topicTriggerRefs = useRef<Record<string, HTMLElement | null>>({});
  const hubTriggerRef = useRef<HTMLElement | null>(null);

  const handleOpenTopic = (topic: ScienceTopic, el: HTMLElement) => {
    topicTriggerRefs.current[topic.id] = el;
    setSelectedTopic(topic);
  };

  const handleCloseTopic = () => {
    const id = selectedTopic?.id;
    setSelectedTopic(null);
    if (id && topicTriggerRefs.current[id]) {
      topicTriggerRefs.current[id]?.focus();
    }
  };

  const handleOpenHub = (el: HTMLElement) => {
    hubTriggerRef.current = el;
    setHubModalOpen(true);
  };

  const handleCloseHub = () => {
    setHubModalOpen(false);
    hubTriggerRef.current?.focus();
  };

  return (
    <section id="science" className="teaser4-section teaser4-science-section" aria-labelledby="science-heading">
      <div className="teaser4-section-container">
        {/* Section Header */}
        <div className="teaser4-section-head">
          <p className="teaser4-eyebrow">SKIN KNOWS.</p>
          <h2 id="science-heading" className="teaser4-section-title">
            Here’s why.
          </h2>
          <p className="teaser4-section-lead">
            Sleep. Stress. Recovery. <br />
            Your skin doesn’t live apart from the rest of you.
          </p>
        </div>

        {/* 3 Editorial Rows */}
        <div className="teaser4-science-list" role="list">
          {scienceTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className="teaser4-science-row"
              role="listitem"
              onClick={(e) => handleOpenTopic(topic, e.currentTarget)}
              aria-haspopup="dialog"
              aria-label={`Explore research on ${topic.title}`}
            >
              <div className="teaser4-science-row-text">
                <span className="teaser4-science-row-title">{topic.title}</span>
                <span className="teaser4-science-row-desc">{topic.label}</span>
              </div>
              <div className="teaser4-science-row-arrow" aria-hidden="true">
                <ArrowRight size={18} />
              </div>
            </button>
          ))}
        </div>

        {/* Bridge & Hub CTA */}
        <div className="teaser4-science-footer">
          <p className="teaser4-science-bridge">
            Research helps explain the connection. <br />
            Your own patterns make it personal.
          </p>
          <button
            type="button"
            className="teaser4-btn-pill teaser4-btn-secondary teaser4-science-hub-btn"
            onClick={(e) => handleOpenHub(e.currentTarget)}
            aria-haspopup="dialog"
            data-science-cta="true"
          >
            <span>Explore Skin Science</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------
          1. Topic Detail Modal
          ------------------------------------------------------------ */}
      <Dialog
        open={Boolean(selectedTopic)}
        onOpenChange={(open) => {
          if (!open) handleCloseTopic();
        }}
      >
        <DialogContent className="teaser4-science-dialog" showCloseButton={false}>
          {selectedTopic && (
            <div className="teaser4-science-modal-inner">
              <div className="teaser4-modal-top-bar">
                <span className="teaser4-modal-eyebrow">SKIN SCIENCE</span>
                <button
                  type="button"
                  className="teaser4-modal-close-icon-btn"
                  onClick={handleCloseTopic}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <DialogTitle className="teaser4-dialog-title">
                {selectedTopic.title}
              </DialogTitle>

              <DialogDescription className="teaser4-modal-topic-desc">
                {selectedTopic.label}
              </DialogDescription>

              <div className="teaser4-modal-body-paras">
                {selectedTopic.body.split("\n\n").map((para, i) => (
                  <p key={i} className="teaser4-modal-para">
                    {para}
                  </p>
                ))}
              </div>

              {selectedTopic.highlight && (
                <div className="teaser4-modal-quote-box">
                  <span className="teaser4-modal-quote">
                    “{selectedTopic.highlight}”
                  </span>
                </div>
              )}

              <div className="teaser4-modal-source-note">
                <span className="teaser4-modal-source-label">Source reference:</span>{" "}
                <span className="teaser4-modal-source-val">{selectedTopic.sourceName}</span>
              </div>

              <div className="teaser4-modal-actions">
                <a
                  href={selectedTopic.destination}
                  target="_blank"
                  rel="noreferrer"
                  className="teaser4-btn-pill teaser4-modal-primary-btn"
                  onClick={handleCloseTopic}
                >
                  <span>Read on PubMed</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
                <button
                  type="button"
                  className="teaser4-modal-dismiss-btn"
                  onClick={handleCloseTopic}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------
          2. Skin Science Hub Modal
          ------------------------------------------------------------ */}
      <Dialog
        open={hubModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseHub();
        }}
      >
        <DialogContent className="teaser4-science-dialog" showCloseButton={true}>
          <div className="teaser4-science-modal-inner">
            <span className="teaser4-modal-eyebrow">RESEARCH FOUNDATION</span>
            <DialogTitle className="teaser4-dialog-title">
              Skin Science &amp; Biometrics
            </DialogTitle>
            <DialogDescription className="teaser4-modal-topic-desc">
              Independent dermatological and circadian research supporting the mind-body-skin axis.
            </DialogDescription>
            <div className="teaser4-modal-body-paras">
              <p className="teaser4-modal-para">
                Circadian biology shows that epidermal barrier repair, cellular proliferation, and trans-epidermal water loss undergo daily oscillation regulated by nighttime rest.
              </p>
              <p className="teaser4-modal-para">
                When systemic recovery is suppressed, peripheral autonomic signals reflect altered skin comfort. 3fig surfaces these correlations without medical diagnosis.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
