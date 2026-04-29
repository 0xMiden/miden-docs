#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const fix = process.argv.includes("--fix");
const markdownExtensions = new Set([".md", ".mdx"]);
const docsRoots = [
  path.join(repoRoot, "docs"),
  ...fs
    .readdirSync(path.join(repoRoot, "versioned_docs"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(repoRoot, "versioned_docs", entry.name)),
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (markdownExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join(path.posix.sep);
}

function getRoot(filePath) {
  return docsRoots.find((root) => filePath.startsWith(`${root}${path.sep}`));
}

function splitUrl(rawUrl) {
  const suffixIndex = rawUrl.search(/[?#]/);

  if (suffixIndex === -1) {
    return { pathname: rawUrl, suffix: "" };
  }

  return {
    pathname: rawUrl.slice(0, suffixIndex),
    suffix: rawUrl.slice(suffixIndex),
  };
}

function isRelativeDocCandidate(rawUrl) {
  if (!(rawUrl.startsWith("./") || rawUrl.startsWith("../"))) {
    return false;
  }

  const { pathname } = splitUrl(rawUrl);
  return !path.posix.extname(pathname);
}

function candidateFiles(root, sourceFile, rawUrl) {
  const { pathname } = splitUrl(rawUrl);
  const sourceDir = path.posix.dirname(
    toPosix(path.relative(root, sourceFile)),
  );
  const target = path.posix.normalize(path.posix.join(sourceDir, pathname));
  const rootPosix = toPosix(root);

  const directCandidates = [
    `${target}.md`,
    `${target}.mdx`,
    path.posix.join(target, "index.md"),
    path.posix.join(target, "index.mdx"),
  ].map((candidate) => path.join(rootPosix, candidate));

  return [
    ...directCandidates,
    ...numberPrefixedCandidates(rootPosix, target),
  ];
}

function numberPrefixedCandidates(root, target) {
  const targetDir = path.posix.dirname(target);
  const targetBase = path.posix.basename(target);
  const absoluteDir = path.join(root, targetDir);

  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  const candidates = [];
  const prefixPattern = new RegExp(`^\\d+[-_]${escapeRegExp(targetBase)}(?:\\.mdx?)?$`);

  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    if (!prefixPattern.test(entry.name)) {
      continue;
    }

    const candidate = path.join(absoluteDir, entry.name);

    if (entry.isFile() && markdownExtensions.has(path.extname(entry.name))) {
      candidates.push(candidate);
    }

    if (entry.isDirectory()) {
      candidates.push(path.join(candidate, "index.md"));
      candidates.push(path.join(candidate, "index.mdx"));
    }
  }

  return candidates;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripNumberPrefix(value) {
  return value.replace(/^\d+[-_]/, "");
}

function resolveTarget(root, sourceFile, rawUrl) {
  for (const candidate of candidateFiles(root, sourceFile, rawUrl)) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

function relativeMarkdownPath(sourceFile, targetFile, suffix) {
  const sourceDir = path.posix.dirname(toPosix(sourceFile));
  let relativePath = path.posix.relative(sourceDir, toPosix(targetFile));

  if (!relativePath.startsWith(".")) {
    relativePath = `./${relativePath}`;
  }

  return `${relativePath}${suffix}`;
}

function docId(root, targetFile) {
  return toPosix(path.relative(root, targetFile))
    .replace(/\.mdx?$/, "")
    .split("/")
    .map(stripNumberPrefix)
    .join("/");
}

function normalizeMarkdownLink(root, sourceFile, rawUrl) {
  if (!isRelativeDocCandidate(rawUrl)) {
    return rawUrl;
  }

  const target = resolveTarget(root, sourceFile, rawUrl);

  if (!target) {
    return rawUrl;
  }

  const { suffix } = splitUrl(rawUrl);
  return relativeMarkdownPath(sourceFile, target, suffix);
}

function normalizeMarkdownLinks(root, sourceFile, content) {
  let normalized = content.replace(
    /(!?\[[^\]]*?\]\()(<[^>\s]+>|[^\s)]+)([^)]*\))/g,
    (match, prefix, rawUrl, suffix) => {
      const wrapped = rawUrl.startsWith("<") && rawUrl.endsWith(">");
      const url = wrapped ? rawUrl.slice(1, -1) : rawUrl;
      const normalizedUrl = normalizeMarkdownLink(root, sourceFile, url);

      if (normalizedUrl === url) {
        return match;
      }

      return `${prefix}${wrapped ? `<${normalizedUrl}>` : normalizedUrl}${suffix}`;
    },
  );

  normalized = normalized.replace(
    /^(\s*\[[^\]]+\]:\s+)(\S+)(.*)$/gm,
    (match, prefix, rawUrl, suffix) => {
      const normalizedUrl = normalizeMarkdownLink(root, sourceFile, rawUrl);

      if (normalizedUrl === rawUrl) {
        return match;
      }

      return `${prefix}${normalizedUrl}${suffix}`;
    },
  );

  return normalized;
}

function normalizeCardLinks(root, sourceFile, content) {
  return content.replace(/<Card\b[^>\n]*\bhref="([^"]+)"[^>\n]*>/g, (tag, rawUrl) => {
    if (!isRelativeDocCandidate(rawUrl)) {
      return tag;
    }

    const target = resolveTarget(root, sourceFile, rawUrl);

    if (!target) {
      return tag;
    }

    const { suffix } = splitUrl(rawUrl);
    const docHash = suffix.startsWith("#") ? suffix : "";
    const id = docId(root, target);
    return tag.replace(
      `href="${rawUrl}"`,
      `docId="${id}"${docHash ? ` hash="${docHash}"` : ""}`,
    );
  });
}

const changedFiles = [];

for (const root of docsRoots) {
  for (const file of walk(root)) {
    const content = fs.readFileSync(file, "utf8");
    const normalized = normalizeCardLinks(
      root,
      file,
      normalizeMarkdownLinks(root, file, content),
    );

    if (normalized !== content) {
      changedFiles.push(path.relative(repoRoot, file));

      if (fix) {
        fs.writeFileSync(file, normalized);
      }
    }
  }
}

if (changedFiles.length > 0) {
  console.log(
    `${fix ? "Updated" : "Would update"} ${changedFiles.length} docs files.`,
  );
  for (const file of changedFiles) {
    console.log(file);
  }
  process.exit(fix ? 0 : 1);
}

console.log("Docs links are already normalized.");
