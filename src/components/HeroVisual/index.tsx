import React from "react";
import styles from "./styles.module.css";

/**
 * A 6-stage, ~8s looping animation of the Miden transaction lifecycle:
 *
 *   1. COMPOSE  — redacted transaction rows draw in on the client side
 *   2. PROVE    — ember sweep scans; a proof glyph materializes below
 *   3. SUBMIT   — the proof slides right along a dashed arrow to the sequencer
 *   4. BATCH    — three sibling proofs join ours; they compress into a single batch block
 *   5. COMMIT   — the bottom chrome row populates a public hex commitment
 *   6. SEALED   — a green "sealed" pill fades in, brief hold, loop
 *
 * Pure SVG + CSS. No canvas, no JS. Respects prefers-reduced-motion via
 * the global guard in _motion.css.
 */
export default function HeroVisual(): JSX.Element {
  const vbWidth = 380;
  const vbHeight = 220;

  // Client-side redacted rows — the tx being built.
  const clientBars: Array<{ y: number; w: number }> = [
    { y: 46, w: 80 },
    { y: 66, w: 62 },
    { y: 86, w: 90 },
    { y: 106, w: 48 },
  ];

  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.frame}>
        {/* top chrome */}
        <div className={styles.chromeTop}>
          <svg
            className={styles.lockIcon}
            width="11"
            height="11"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="2.5"
              y="6.5"
              width="9"
              height="6.5"
              rx="1.25"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M4.5 6.5V4.25a2.5 2.5 0 0 1 5 0V6.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <span className={styles.chromeLabel}>
            Client-side proving · private batch
          </span>
          <span className={styles.chromeStatus}>
            <span className={styles.chromeDot} />
            proving
          </span>
        </div>

        {/* body SVG */}
        <svg
          className={styles.lattice}
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          xmlns="http://www.w3.org/2000/svg"
          role="presentation"
        >
          <defs>
            {/* ember sweep gradient */}
            <linearGradient id="txSweep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop
                offset="45%"
                stopColor="var(--color-brand)"
                stopOpacity="0.9"
              />
              <stop
                offset="55%"
                stopColor="var(--color-brand)"
                stopOpacity="0.9"
              />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* redacted bar gradient */}
            <linearGradient id="txBar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-border-strong)" />
              <stop offset="100%" stopColor="var(--color-border)" />
            </linearGradient>
          </defs>

          {/* ================== CLIENT ZONE (x: 14..150) ================== */}
          <g className={styles.clientZone}>
            <text x="14" y="28" className={styles.zoneLabel}>
              Client
            </text>
            <line
              x1="54"
              y1="24"
              x2="150"
              y2="24"
              className={styles.labelRule}
            />

            {/* redacted tx rows */}
            {clientBars.map((b, i) => (
              <rect
                key={`cbar-${i}`}
                x="14"
                y={b.y}
                width={(136 * b.w) / 100}
                height="6"
                rx="2"
                ry="2"
                fill="url(#txBar)"
                className={styles.clientBar}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}

            {/* proof glyph (client-side) */}
            <g className={styles.proofGlyph}>
              <rect
                x="18"
                y="140"
                width="32"
                height="22"
                rx="4"
                ry="4"
                className={styles.proofBox}
              />
              <text x="34" y="156" className={styles.proofGlyphText}>
                π
              </text>
            </g>
          </g>

          {/* ================== FLOW ZONE (x: 150..236) ================== */}
          <g className={styles.flowZone}>
            {/* dashed arrow */}
            <line
              x1="150"
              y1="151"
              x2="232"
              y2="151"
              className={styles.flowLine}
            />
            <path
              d="M229 147 L236 151 L229 155"
              className={styles.flowArrow}
            />

            {/* travelling proof mote */}
            <rect
              x="150"
              y="141"
              width="18"
              height="20"
              rx="3"
              ry="3"
              className={styles.flowMote}
            />
          </g>

          {/* ================== SEQUENCER ZONE (x: 236..366) ================== */}
          <g className={styles.seqZone}>
            <text x="236" y="28" className={styles.zoneLabel}>
              Sequencer
            </text>
            <line
              x1="300"
              y1="24"
              x2="366"
              y2="24"
              className={styles.labelRule}
            />

            {/* sibling proofs (stagger in, then collapse into batch) */}
            <rect
              x="248"
              y="46"
              width="24"
              height="16"
              rx="3"
              ry="3"
              className={`${styles.siblingProof} ${styles.sib1}`}
            />
            <rect
              x="280"
              y="46"
              width="24"
              height="16"
              rx="3"
              ry="3"
              className={`${styles.siblingProof} ${styles.sib2}`}
            />
            <rect
              x="248"
              y="68"
              width="24"
              height="16"
              rx="3"
              ry="3"
              className={`${styles.siblingProof} ${styles.sib3}`}
            />
            <rect
              x="312"
              y="46"
              width="24"
              height="16"
              rx="3"
              ry="3"
              className={`${styles.siblingProof} ${styles.sib4}`}
            />

            {/* arriving proof slot — this is where our proof lands */}
            <rect
              x="280"
              y="68"
              width="24"
              height="16"
              rx="3"
              ry="3"
              className={styles.arrivingProof}
            />

            {/* batch block — all proofs fuse into this single commitment */}
            <g className={styles.batchGroup}>
              <rect
                x="262"
                y="102"
                width="76"
                height="42"
                rx="6"
                ry="6"
                className={styles.batchBlock}
              />
              <text x="300" y="128" className={styles.batchLabel}>
                BATCH
              </text>
            </g>
          </g>

          {/* ember sweep (runs during the PROVE stage only) */}
          <rect
            x={0}
            y={-vbHeight}
            width="160"
            height={vbHeight * 0.55}
            fill="url(#txSweep)"
            className={styles.sweep}
          />

          {/* public commitment divider at bottom */}
          <line
            x1="14"
            y1={vbHeight - 14}
            x2={vbWidth - 14}
            y2={vbHeight - 14}
            className={styles.divider}
          />
        </svg>

        {/* bottom chrome — public commitment + verified */}
        <div className={styles.chromeBottom}>
          <span className={styles.chromeLabel}>Public commitment</span>
          <code className={styles.hashValue}>
            0x
            <span className={styles.hashPiece} data-delay="0">a3</span>
            <span className={styles.hashPiece} data-delay="1">f9</span>
            <span className={styles.hashPiece} data-delay="2">12</span>
            <span className={styles.hashPiece} data-delay="3">7b</span>
            <span className={styles.hashPiece} data-delay="4">e0</span>
            <span className={styles.hashPiece} data-delay="5">4c</span>
            <span className={styles.hashPiece} data-delay="6">55</span>
            <span className={styles.hashPiece} data-delay="7">d8</span>
            …
          </code>
          <span className={styles.verifyBadge}>
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m2 5 2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            sealed
          </span>
        </div>
      </div>

      {/* decorative ember halo */}
      <div className={styles.glow} aria-hidden="true" />
    </div>
  );
}
