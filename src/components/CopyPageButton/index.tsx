import React, { useState, useCallback } from "react";
import styles from "./styles.module.css";

/**
 * Converts HTML content to clean markdown-like text.
 * Preserves headings, code blocks, lists, and basic formatting.
 */
function htmlToCleanText(element: Element): string {
  const lines: string[] = [];

  function processNode(node: Node, depth: number = 0): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        lines.push(text);
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as Element;
    const tagName = el.tagName.toLowerCase();

    // Skip certain elements
    if (
      el.classList.contains("theme-doc-toc-desktop") ||
      el.classList.contains("theme-doc-toc-mobile") ||
      el.classList.contains("pagination-nav") ||
      el.classList.contains("theme-doc-breadcrumbs") ||
      el.classList.contains("theme-doc-version-badge") ||
      el.classList.contains("theme-doc-version-banner") ||
      el.classList.contains("copyPageButton") ||
      tagName === "button" ||
      tagName === "nav" ||
      tagName === "script" ||
      tagName === "style"
    ) {
      return;
    }

    // Handle different elements
    switch (tagName) {
      case "h1":
        lines.push(`\n# ${el.textContent?.trim()}\n`);
        break;
      case "h2":
        lines.push(`\n## ${el.textContent?.trim()}\n`);
        break;
      case "h3":
        lines.push(`\n### ${el.textContent?.trim()}\n`);
        break;
      case "h4":
        lines.push(`\n#### ${el.textContent?.trim()}\n`);
        break;
      case "h5":
        lines.push(`\n##### ${el.textContent?.trim()}\n`);
        break;
      case "h6":
        lines.push(`\n###### ${el.textContent?.trim()}\n`);
        break;
      case "p":
        lines.push(`\n${el.textContent?.trim()}\n`);
        break;
      case "pre":
        // Code block - get the language if available
        const codeEl = el.querySelector("code");
        const lang =
          codeEl?.className
            ?.split(" ")
            .find((c) => c.startsWith("language-"))
            ?.replace("language-", "") || "";
        const code = codeEl?.textContent?.trim() || el.textContent?.trim();
        lines.push(`\n\`\`\`${lang}\n${code}\n\`\`\`\n`);
        break;
      case "code":
        // Inline code (if not inside pre)
        if (el.parentElement?.tagName.toLowerCase() !== "pre") {
          lines.push(`\`${el.textContent?.trim()}\``);
        }
        break;
      case "ul":
      case "ol":
        lines.push("");
        el.childNodes.forEach((child) => processNode(child, depth));
        lines.push("");
        break;
      case "li":
        const prefix = el.parentElement?.tagName.toLowerCase() === "ol" ? "1." : "-";
        lines.push(`${"  ".repeat(depth)}${prefix} ${el.textContent?.trim()}`);
        break;
      case "blockquote":
        const quoteText = el.textContent?.trim();
        if (quoteText) {
          lines.push(
            `\n> ${quoteText.split("\n").join("\n> ")}\n`
          );
        }
        break;
      case "table":
        // Handle tables
        const rows = el.querySelectorAll("tr");
        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll("th, td");
          const cellTexts = Array.from(cells).map(
            (cell) => cell.textContent?.trim() || ""
          );
          lines.push(`| ${cellTexts.join(" | ")} |`);
          if (rowIndex === 0 && row.querySelector("th")) {
            lines.push(`| ${cellTexts.map(() => "---").join(" | ")} |`);
          }
        });
        lines.push("");
        break;
      case "a":
        const href = el.getAttribute("href");
        const text = el.textContent?.trim();
        if (href && text && !href.startsWith("#")) {
          lines.push(`[${text}](${href})`);
        } else if (text) {
          lines.push(text);
        }
        break;
      case "strong":
      case "b":
        lines.push(`**${el.textContent?.trim()}**`);
        break;
      case "em":
      case "i":
        lines.push(`*${el.textContent?.trim()}*`);
        break;
      case "br":
        lines.push("\n");
        break;
      case "hr":
        lines.push("\n---\n");
        break;
      case "img":
        const alt = el.getAttribute("alt") || "";
        const src = el.getAttribute("src") || "";
        lines.push(`![${alt}](${src})`);
        break;
      default:
        // Process children for container elements
        if (
          tagName === "div" ||
          tagName === "section" ||
          tagName === "article" ||
          tagName === "main" ||
          tagName === "span"
        ) {
          el.childNodes.forEach((child) => processNode(child, depth));
        }
    }
  }

  processNode(element, 0);

  // Clean up the result
  return lines
    .join("")
    .replace(/\n{3,}/g, "\n\n") // Remove excessive newlines
    .replace(/^\s+|\s+$/g, "") // Trim
    .replace(/[ \t]+$/gm, ""); // Remove trailing spaces
}

interface CopyPageButtonProps {
  className?: string;
}

export default function CopyPageButton({
  className,
}: CopyPageButtonProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    // Find the main content area
    const content = document.querySelector(".theme-doc-markdown.markdown");
    if (!content) {
      console.warn("Could not find markdown content");
      return;
    }

    try {
      const cleanText = htmlToCleanText(content);
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  return (
    <button
      type="button"
      className={`${styles.copyButton} ${className || ""} ${copied ? styles.copied : ""}`}
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy page content"}
      aria-label={copied ? "Copied!" : "Copy page content"}
    >
      {copied ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
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
      )}
      <span className={styles.label}>{copied ? "Copied!" : "Copy page"}</span>
    </button>
  );
}
