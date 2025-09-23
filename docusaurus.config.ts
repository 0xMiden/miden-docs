import type { Config } from "@docusaurus/types";

const isNext = process.env.CHANNEL === "next";

// allow baseUrl override per channel (stable=/, next=/next/)
const baseUrl = process.env.BASE_URL || "/";

const config: Config = {
  title: "The Miden Book",
  tagline: "One stop shop for everything Miden",
  favicon: "img/favicon.ico",

  url: "https://0xpolygonmiden.github.io",
  baseUrl,

  organizationName: "0xPolygonMiden",
  projectName: "miden-docs",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/", // Serve docs at root
        },
        blog: false, // Disable blog
        theme: {
          // customCss: "./src/css/custom.css",
        },
      },
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "miden-base",
        path: "vendor/miden-base/docs",
        routeBasePath: "miden-base",
        sidebarPath: false,
        sidebarItemsGenerator: async ({
          defaultSidebarItemsGenerator,
          ...args
        }) => defaultSidebarItemsGenerator({ ...args }), // uses _category_.json + sidebar_position
        editUrl: ({ docPath }) =>
          `https://github.com/0xMiden/miden-base/edit/${
            isNext ? "docs-next" : "main"
          }/docs/${docPath}`,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "miden-tutorials",
        path: "vendor/miden-tutorials/docs",
        routeBasePath: "miden-tutorials",
        sidebarPath: false,
        sidebarItemsGenerator: async ({
          defaultSidebarItemsGenerator,
          ...args
        }) => defaultSidebarItemsGenerator({ ...args }),
        editUrl: ({ docPath }) =>
          `https://github.com/0xMiden/miden-tutorials/edit/${
            isNext ? "docs-next" : "main"
          }/docs/${docPath}`,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "miden-client",
        path: "vendor/miden-client/docs",
        routeBasePath: "miden-client",
        sidebarPath: false,
        sidebarItemsGenerator: async ({
          defaultSidebarItemsGenerator,
          ...args
        }) => defaultSidebarItemsGenerator({ ...args }),
        editUrl: ({ docPath }) =>
          `https://github.com/0xMiden/miden-client/edit/${
            isNext ? "docs-next" : "main"
          }/docs/${docPath}`,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "miden-node",
        path: "vendor/miden-node/docs",
        routeBasePath: "miden-node",
        sidebarPath: "./sidebars.ts",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "miden-vm",
        path: "vendor/miden-vm/docs",
        routeBasePath: "miden-vm",
        sidebarPath: false,
        sidebarItemsGenerator: async ({
          defaultSidebarItemsGenerator,
          ...args
        }) => defaultSidebarItemsGenerator({ ...args }),
        editUrl: ({ docPath }) =>
          `https://github.com/0xMiden/miden-vm/edit/${
            isNext ? "docs-next" : "main"
          }/docs/${docPath}`,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "miden-compiler",
        path: "vendor/miden-compiler/docs",
        routeBasePath: "miden-compiler",
        sidebarPath: false,
        sidebarItemsGenerator: async ({
          defaultSidebarItemsGenerator,
          ...args
        }) => defaultSidebarItemsGenerator({ ...args }),
        editUrl: ({ docPath }) =>
          `https://github.com/0xMiden/miden-compiler/edit/${
            isNext ? "docs-next" : "main"
          }/docs/${docPath}`,
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    {
      navbar: {
        title: "Miden",
        items: [
          {
            href: "https://github.com/0xPolygonMiden/miden-docs",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Documentation",
            items: [
              {
                label: "Protocol",
                to: "/protocol",
              },
              {
                label: "Client",
                to: "/client",
              },
              {
                label: "Virtual Machine",
                to: "/vm",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/0xPolygonMiden",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Miden contributors.`,
      },
    },
};

export default config;
