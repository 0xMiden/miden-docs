import React, { useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import styles from "./CodeTabs.module.css";

interface CodeExample {
  rust?: {
    code: string;
    output?: string;
  };
  typescript?: {
    code: string;
    output?: string;
  };
}

interface CodeTabsProps {
  example: CodeExample;
  rustFilename?: string;
  tsFilename?: string;
}

export default function CodeTabs({
  example,
  rustFilename = "main.rs",
  tsFilename = "index.ts",
}: CodeTabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<"rust" | "typescript">(
    example.typescript ? "typescript" : "rust"
  );

  const hasRust = !!example.rust;
  const hasTypeScript = !!example.typescript;

  // Don't show tabs if there's only one language
  if (!hasRust || !hasTypeScript) {
    const singleLang = hasRust ? "rust" : "typescript";
    const singleExample = example[singleLang];

    return (
      <div className={styles.codeContainer}>
        <div className={styles.codeSection}>
          <CodeBlock
            language={singleLang}
            title={singleLang === "rust" ? rustFilename : tsFilename}
          >
            {singleExample!.code}
          </CodeBlock>
        </div>
        {singleExample!.output && (
          <div className={styles.outputSection}>
            <div className={styles.outputHeader}>Output</div>
            <CodeBlock language="bash">{singleExample.output}</CodeBlock>
          </div>
        )}
      </div>
    );
  }

  const currentExample = example[activeTab];

  return (
    <div className={styles.codeContainer}>
      <div className={styles.tabContainer}>
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "typescript" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("typescript")}
          >
            TypeScript
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "rust" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("rust")}
          >
            Rust
          </button>
        </div>
      </div>

      <div className={styles.codeSection}>
        <CodeBlock
          language={activeTab}
          title={activeTab === "rust" ? rustFilename : tsFilename}
        >
          {currentExample!.code}
        </CodeBlock>
      </div>
    </div>
  );
}
