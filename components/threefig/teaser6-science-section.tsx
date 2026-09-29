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
    body: "Sleep provides the biological window for epidermal cell repair and barrier restoration. Published clinical literature links poor sleep architecture with elevated trans-epidermal water loss (TEWL) and slower recovery.\n\n3FIG pairs continuous sleep stage metrics with your morning check-ins to make sleep-skin connections visible.",
    highlight: "Deeper restorative sleep supports resilient barrier function.",
    destination: "https://pubmed.ncbi.nlm.nih.gov/42641586/",
    sourceName: "PubMed (NLM ID: 42641586)",
  },
  {
    id: "stress-skin",
    title: "Stress & Skin",
    label: "Autonomic response and cutaneous reactivity",
    body: "Daytime autonomic stress activates neuro-endocrine pathways that elevate systemic cortisol, often triggering sensitivity, redness, and reactive breakouts.\n\n3FIG monitors resting heart rate and HRV trends to help you anticipate days when your skin barrier may need extra support.",
    highlight: "Sustained physiological strain precedes noticeable barrier shifts.",
    destination: "https://pubmed.ncbi.nlm.nih.gov/41962101/",
    sourceName: "PubMed (NLM ID: 41962101)",
  },
  {
    id: "body-signals",
    title: "Body Signals & Skin",
    label: "Physiological baselines and daily vitality",
    body: "Body temperature shifts, movement, and recovery baselines directly interact with metabolic skin health.\n\nBy tracking these vital signals continuously, 3FIG bridges internal body metrics with external skin condition in one integrated view.",
    highlight: "Your skin reflects what is happening beneath the surface.",
    destination: "https://pubmed.ncbi.nlm.nih.gov/42389732/",
    sourceName: "PubMed (NLM ID: 42389732)",
  },
];

export function Teaser6ScienceSection() {
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
    <section id="science" className="teaser6-section teaser6-science-section" aria-labelledby="science-heading">
      <div className="teaser6-section-container">
        {/* Section Header */}
        <div className="teaser6-section-head">
          <p className="teaser6-eyebrow">SKIN PHYSIOLOGY</p>
          <h2 id="science-heading" className="teaser6-section-title">
            The science of <br />
            <span className="teaser6-rose-accent">internal signals.</span>
          </h2>
          <p className="teaser6-section-lead">
            Sleep depth. Autonomic strain. Temperature recovery. <br />
            Your skin responds continuously to what happens beneath the surface.
          </p>
        </div>

        {/* 3 Editorial Rows */}
        <div className="teaser6-science-list" role="list">
          {scienceTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className="teaser6-science-row"
              onClick={(e) => handleOpenTopic(topic, e.currentTarget)}
              aria-label={`Read science brief: ${topic.title} – ${topic.label}`}
              role="listitem"
            >
              <div className="teaser6-science-row-inner">
                <span className="teaser6-science-title">{topic.title}</span>
                <span className="teaser6-science-label">{topic.label}</span>
                <ArrowRight className="teaser6-science-arrow" size={18} aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>

        {/* Explore Hub Action */}
        <div className="teaser6-science-cta-wrap">
          <button
            type="button"
            className="teaser6-science-cta"
            data-science-cta="true"
            onClick={(e) => handleOpenHub(e.currentTarget)}
            aria-label="Explore skin science foundations modal"
          >
            <span>Explore skin science foundations</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Individual Topic Detail Modal */}
      <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && handleCloseTopic()}>
        <DialogContent className="teaser6-science-dialog" showCloseButton={true}>
          {selectedTopic && (
            <div className="teaser6-dialog-inner">
              <span className="teaser6-dialog-eyebrow">RESEARCH FOUNDATION</span>
              <DialogTitle className="teaser6-dialog-title">
                {selectedTopic.title}
              </DialogTitle>
              <DialogDescription className="teaser6-dialog-desc">
                {selectedTopic.label}
              </DialogDescription>

              <blockquote className="teaser6-science-highlight">
                &ldquo;{selectedTopic.highlight}&rdquo;
              </blockquote>

              <div className="teaser6-science-body">
                {selectedTopic.body.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="teaser6-science-source-box">
                <span className="teaser6-source-label">Peer-Reviewed Literature:</span>
                <a
                  href={selectedTopic.destination}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="teaser6-source-link"
                >
                  {selectedTopic.sourceName}
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comprehensive Science Hub Modal */}
      <Dialog open={hubModalOpen} onOpenChange={(open) => !open && handleCloseHub()}>
        <DialogContent className="teaser6-science-dialog is-hub" showCloseButton={true}>
          <div className="teaser6-dialog-inner">
            <span className="teaser6-dialog-eyebrow">OVERVIEW</span>
            <DialogTitle className="teaser6-dialog-title">
              Skin Science at 3FIG
            </DialogTitle>
            <DialogDescription className="teaser6-dialog-desc">
              How physiological bio-telemetry pairs with daily observations to build a clearer picture of skin resilience.
            </DialogDescription>

            <div className="teaser6-science-hub-list">
              {scienceTopics.map((topic) => (
                <div key={topic.id} className="teaser6-science-hub-card">
                  <h4 className="teaser6-hub-card-title">{topic.title}</h4>
                  <p className="teaser6-hub-card-body">{topic.body.split("\n\n")[0]}</p>
                  <a
                    href={topic.destination}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="teaser6-hub-card-link"
                  >
                    View publication ({topic.sourceName.split(" ")[0]})
                    <ArrowRight size={12} aria-hidden="true" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
