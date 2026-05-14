const OG_IMAGE_ROOT = "img/og";
const DEFAULT_OG_IMAGE = `${OG_IMAGE_ROOT}/miden-docs.png`;

type OgImageRule = {
  pathPrefix: string;
  image: string;
};

const OG_IMAGE_RULES: OgImageRule[] = [
  { pathPrefix: "/builder/get-started/your-first-smart-contract", image: "first-smart-contract.png" },
  { pathPrefix: "/builder/tools/clients/react-sdk", image: "react-sdk.png" },
  { pathPrefix: "/builder/tools/clients/rust-client/get-started", image: "rust-client-get-started.png" },
  { pathPrefix: "/builder/tools/clients/rust-client/cli", image: "rust-client-cli.png" },
  { pathPrefix: "/builder/tools/clients/rust-client", image: "rust-client.png" },
  { pathPrefix: "/builder/tools/clients/web-client", image: "typescript-client.png" },
  { pathPrefix: "/builder/tutorials/miden-bank", image: "miden-bank.png" },
  { pathPrefix: "/builder/tutorials/recipes/web", image: "typescript-recipes.png" },
  { pathPrefix: "/builder/tutorials/recipes/rust", image: "rust-recipes.png" },
  { pathPrefix: "/builder/tools/clients", image: "clients.png" },
  { pathPrefix: "/builder/tools/note-transport", image: "note-transport.png" },
  { pathPrefix: "/builder/tools", image: "tools.png" },
  { pathPrefix: "/builder/miden-guardian", image: "miden-guardian.png" },
  { pathPrefix: "/builder/private-multisig", image: "private-multisig.png" },
  { pathPrefix: "/builder/smart-contracts/accounts", image: "smart-contract-accounts.png" },
  { pathPrefix: "/builder/smart-contracts/notes", image: "smart-contract-notes.png" },
  { pathPrefix: "/builder/smart-contracts/transactions", image: "smart-contract-transactions.png" },
  { pathPrefix: "/builder/smart-contracts", image: "smart-contracts.png" },
  { pathPrefix: "/builder/tutorials", image: "tutorials.png" },
  { pathPrefix: "/builder/get-started", image: "get-started.png" },
  { pathPrefix: "/builder/migration", image: "migration.png" },
  { pathPrefix: "/builder/glossary", image: "reference.png" },
  { pathPrefix: "/builder/faq", image: "reference.png" },
  { pathPrefix: "/builder", image: "build.png" },
  { pathPrefix: "/core-concepts/protocol/account", image: "protocol-accounts.png" },
  { pathPrefix: "/core-concepts/protocol", image: "protocol.png" },
  { pathPrefix: "/core-concepts/miden-base/account", image: "protocol-accounts.png" },
  { pathPrefix: "/core-concepts/miden-base", image: "protocol.png" },
  { pathPrefix: "/core-concepts/node/operator", image: "node-operator.png" },
  { pathPrefix: "/core-concepts/node", image: "node.png" },
  { pathPrefix: "/core-concepts/miden-node/operator", image: "node-operator.png" },
  { pathPrefix: "/core-concepts/miden-node", image: "node.png" },
  { pathPrefix: "/core-concepts/miden-vm/user_docs/assembly", image: "miden-assembly.png" },
  { pathPrefix: "/core-concepts/miden-vm/user_docs/core_lib", image: "core-library.png" },
  { pathPrefix: "/core-concepts/miden-vm/user_docs", image: "vm-user-docs.png" },
  { pathPrefix: "/core-concepts/miden-vm/design/stack", image: "vm-stack.png" },
  { pathPrefix: "/core-concepts/miden-vm/design", image: "vm-design.png" },
  { pathPrefix: "/core-concepts/miden-vm", image: "miden-vm.png" },
  { pathPrefix: "/core-concepts/compiler/usage", image: "compiler-usage.png" },
  { pathPrefix: "/core-concepts/compiler/guides", image: "compiler-guides.png" },
  { pathPrefix: "/core-concepts/compiler/appendix", image: "compiler-appendix.png" },
  { pathPrefix: "/core-concepts/compiler", image: "compiler.png" },
  { pathPrefix: "/core-concepts", image: "core-concepts.png" },
  { pathPrefix: "/quick-start/your-first-smart-contract", image: "first-smart-contract.png" },
  { pathPrefix: "/quick-start", image: "get-started.png" },
  { pathPrefix: "/miden-client/rust-client", image: "rust-client.png" },
  { pathPrefix: "/miden-client/web-client", image: "typescript-client.png" },
  { pathPrefix: "/miden-client", image: "clients.png" },
  { pathPrefix: "/miden-tutorials/rust-client", image: "rust-recipes.png" },
  { pathPrefix: "/miden-tutorials/web-client", image: "typescript-recipes.png" },
  { pathPrefix: "/miden-tutorials", image: "tutorials.png" },
  { pathPrefix: "/miden-base/account", image: "protocol-accounts.png" },
  { pathPrefix: "/miden-base", image: "protocol.png" },
  { pathPrefix: "/miden-node/operator", image: "node-operator.png" },
  { pathPrefix: "/miden-node", image: "node.png" },
  { pathPrefix: "/miden-vm/user_docs/assembly", image: "miden-assembly.png" },
  { pathPrefix: "/miden-vm/user_docs/core_lib", image: "core-library.png" },
  { pathPrefix: "/miden-vm/user_docs", image: "vm-user-docs.png" },
  { pathPrefix: "/miden-vm/design/stack", image: "vm-stack.png" },
  { pathPrefix: "/miden-vm/design", image: "vm-design.png" },
  { pathPrefix: "/miden-vm", image: "miden-vm.png" },
  { pathPrefix: "/compiler/usage", image: "compiler-usage.png" },
  { pathPrefix: "/compiler/guides", image: "compiler-guides.png" },
  { pathPrefix: "/compiler/appendix", image: "compiler-appendix.png" },
  { pathPrefix: "/compiler", image: "compiler.png" },
];

function normalizeDocPath(permalink: string): string {
  const pathname = permalink.startsWith("http")
    ? new URL(permalink).pathname
    : permalink;
  const withoutTrailingSlash = pathname.replace(/\/+$/, "") || "/";

  const withoutVersionPrefix = withoutTrailingSlash.replace(
    /^\/(?:next|\d+\.\d+)(?=\/|$)/,
    "",
  );

  if (withoutVersionPrefix) {
    return withoutVersionPrefix;
  }

  return "/";
}

function matchesPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getDocOgImage(permalink: string): string {
  const normalizedPath = normalizeDocPath(permalink);
  const rule = OG_IMAGE_RULES.find(({ pathPrefix }) =>
    matchesPathPrefix(normalizedPath, pathPrefix),
  );

  return rule ? `${OG_IMAGE_ROOT}/${rule.image}` : DEFAULT_OG_IMAGE;
}
