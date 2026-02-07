import React, { useState, useCallback, type ReactNode } from "react";
import TurndownService from "turndown";
import styles from "./styles.module.css";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Preserve code block language hints from Prism-highlighted blocks
turndownService.addRule("fencedCodeBlock", {
  filter(node) {
    return (
      node.nodeName === "PRE" &&
      node.querySelector("code") !== null
    );
  },
  replacement(_content, node) {
    const codeEl = (node as HTMLElement).querySelector("code");
    if (!codeEl) return _content;

    // Extract language from class like "language-rust" or "prism-code language-rust"
    const langMatch = codeEl.className.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1] : "";

    // Get the raw text content (strips Prism span wrappers)
    const code = codeEl.textContent || "";

    return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
  },
});

// Convert tables properly
turndownService.addRule("table", {
  filter: "table",
  replacement(_content, node) {
    const table = node as HTMLTableElement;
    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length === 0) return _content;

    const result: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll("th, td"));
      const row = cells.map((c) => (c.textContent || "").trim()).join(" | ");
      result.push(`| ${row} |`);

      // Add separator after header row
      if (i === 0) {
        const separator = cells.map(() => "---").join(" | ");
        result.push(`| ${separator} |`);
      }
    }

    return `\n\n${result.join("\n")}\n\n`;
  },
});

// Skip copy buttons inside code blocks, nav elements, TOC, etc.
turndownService.addRule("skipNonContent", {
  filter(node) {
    const el = node as HTMLElement;
    if (!el.classList) return false;
    // Skip copy buttons, hash links, theme toggles, nav elements
    return (
      el.classList.contains("clean-btn") ||
      el.classList.contains("hash-link") ||
      el.tagName === "NAV" ||
      el.getAttribute("role") === "navigation"
    );
  },
  replacement() {
    return "";
  },
});

export default function CopyPageButton(): ReactNode {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    // Find the main article content
    const article = document.querySelector("article .markdown");
    if (!article) return;

    // Clone to avoid mutating the DOM
    const clone = article.cloneNode(true) as HTMLElement;

    // Remove elements that shouldn't be in the copied content
    clone
      .querySelectorAll(
        ".theme-admonition-icon, .copy-page-button-container, button.clean-btn, .hash-link, nav, [role='navigation']"
      )
      .forEach((el) => el.remove());

    // Get the page title from the content heading or document
    const title = document.querySelector("article header h1")?.textContent ||
      document.querySelector("h1")?.textContent ||
      document.title;

    const markdown = turndownService.turndown(clone.innerHTML);
    const fullContent = `# ${title}\n\n${markdown}`;

    try {
      await navigator.clipboard.writeText(fullContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = fullContent;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <div className={`copy-page-button-container ${styles.container}`}>
      <button
        className={styles.button}
        onClick={handleCopy}
        title="Copy page as Markdown"
        aria-label="Copy page as Markdown"
        type="button"
      >
        {copied ? (
          <>
            <CheckIcon />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <CopyIcon />
            <span>Copy page</span>
          </>
        )}
      </button>
    </div>
  );
}

function CopyIcon(): ReactNode {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon(): ReactNode {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
