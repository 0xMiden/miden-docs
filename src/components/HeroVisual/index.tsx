import React from "react";
import styles from "./styles.module.css";

/**
 * A stylized "private state → public commitment" visualization for the
 * landing hero. Inside a terminal-like frame we render:
 *
 *   1. A stack of redacted bars of varying widths — the private account
 *      state nobody but the user sees. Muted base color, subtle shimmer.
 *   2. A padlock/seal mark centered on the stack — the privacy boundary.
 *   3. An ember scan-line sweeps across, briefly highlighting bars in
 *      ember as it passes (suggesting proof generation in progress).
 *   4. A "commitment" strip below with a cycling hex hash — the single
 *      piece of data actually published on-chain.
 *
 * Pure SVG + CSS. Respects prefers-reduced-motion via the global guard.
 */
export default function HeroVisual(): JSX.Element {
  const vbWidth = 300;
  const vbHeight = 220;

  // Redacted bars — the "private state" of the account, shown as
  // ragged-right paragraph blocks. Each entry is [y-position, width%].
  const bars: Array<{ y: number; w: number; delay: number }> = [
    { y: 28, w: 78, delay: 0 },
    { y: 46, w: 58, delay: 120 },
    { y: 64, w: 84, delay: 240 },
    { y: 82, w: 42, delay: 360 },
    { y: 108, w: 68, delay: 520 },
    { y: 126, w: 90, delay: 640 },
    { y: 144, w: 52, delay: 760 },
    { y: 162, w: 72, delay: 880 },
  ];

  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.frame}>
        {/* top chrome row */}
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
            Private state · Account 0x…A3F9
          </span>
          <span className={styles.chromeStatus}>
            <span className={styles.chromeDot} />
            proving
          </span>
        </div>

        {/* body */}
        <svg
          className={styles.lattice}
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          xmlns="http://www.w3.org/2000/svg"
          role="presentation"
        >
          <defs>
            {/* subtle diagonal sweep (top→bottom left-weighted) */}
            <linearGradient id="privSweep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop
                offset="42%"
                stopColor="var(--color-brand)"
                stopOpacity="0.75"
              />
              <stop
                offset="58%"
                stopColor="var(--color-brand)"
                stopOpacity="0.75"
              />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* gradient for the redacted bars so they feel "alive" */}
            <linearGradient id="privBar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-border-strong)" />
              <stop offset="100%" stopColor="var(--color-border)" />
            </linearGradient>
          </defs>

          {/* panel label — PRIVATE on the left edge, vertically written */}
          <g className={styles.labelRow}>
            <text
              x="14"
              y="22"
              className={styles.panelLabel}
            >
              private
            </text>
            <line
              x1="52"
              y1="18"
              x2={vbWidth - 14}
              y2="18"
              className={styles.labelRule}
            />
          </g>

          {/* redacted bars */}
          {bars.map((b, i) => {
            const x = 14;
            const maxWidth = vbWidth - 28;
            const w = (maxWidth * b.w) / 100;
            return (
              <rect
                key={`bar-${i}`}
                x={x}
                y={b.y}
                width={w}
                height={6}
                rx={2}
                ry={2}
                fill="url(#privBar)"
                className={styles.bar}
                style={{ animationDelay: `${b.delay}ms` }}
              />
            );
          })}

          {/* center seal — a subtle key/lock circle that sits on top of bars */}
          <g transform={`translate(${vbWidth - 60} ${110})`}>
            <circle
              cx="0"
              cy="0"
              r="22"
              className={styles.sealRing}
            />
            <circle
              cx="0"
              cy="0"
              r="14"
              className={styles.sealInner}
            />
            <path
              d="M-4 -1 a4 4 0 0 1 8 0"
              className={styles.sealShackle}
            />
            <rect
              x="-5"
              y="-1"
              width="10"
              height="8"
              rx="1.5"
              className={styles.sealBody}
            />
          </g>

          {/* public divider — thin dashed line at the bottom of the panel */}
          <line
            x1="14"
            y1={vbHeight - 14}
            x2={vbWidth - 14}
            y2={vbHeight - 14}
            className={styles.divider}
          />

          {/* ember sweep overlay */}
          <rect
            x={0}
            y={-vbHeight}
            width={vbWidth}
            height={vbHeight * 0.45}
            fill="url(#privSweep)"
            className={styles.sweep}
          />
        </svg>

        {/* bottom chrome — the public commitment (hash) + verified pill */}
        <div className={styles.chromeBottom}>
          <span className={styles.chromeLabel}>Public commitment</span>
          <code className={styles.hashValue}>
            0x
            <span data-anim-cycle>a3</span>
            <span data-anim-cycle>f9</span>
            <span data-anim-cycle>12</span>
            <span data-anim-cycle>7b</span>
            <span data-anim-cycle>e0</span>
            <span data-anim-cycle>4c</span>
            <span data-anim-cycle>55</span>
            <span data-anim-cycle>d8</span>
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

      {/* decorative soft ember glow behind the whole thing */}
      <div className={styles.glow} aria-hidden="true" />
    </div>
  );
}
