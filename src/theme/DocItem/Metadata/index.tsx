import React, { type ReactNode } from "react";
import { PageMetadata } from "@docusaurus/theme-common";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { getDocOgImage } from "../../../utils/ogImages";

export default function DocItemMetadata(): ReactNode {
  const { metadata, frontMatter, assets } = useDoc();
  const image = assets.image ?? frontMatter.image ?? getDocOgImage(metadata.permalink);

  return (
    <PageMetadata
      title={metadata.title}
      description={metadata.description}
      keywords={frontMatter.keywords}
      image={image}
    >
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${metadata.title} | Miden Docs`} />
    </PageMetadata>
  );
}
