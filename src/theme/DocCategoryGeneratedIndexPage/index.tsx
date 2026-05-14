import React, { type ReactNode } from "react";
import { PageMetadata } from "@docusaurus/theme-common";
import OriginalDocCategoryGeneratedIndexPage from "@theme-original/DocCategoryGeneratedIndexPage";
import type { Props } from "@theme/DocCategoryGeneratedIndexPage";
import { getDocOgImage } from "../../utils/ogImages";

export default function DocCategoryGeneratedIndexPage(props: Props): ReactNode {
  const image =
    props.categoryGeneratedIndex.image ??
    getDocOgImage(props.categoryGeneratedIndex.permalink);

  return (
    <>
      <OriginalDocCategoryGeneratedIndexPage {...props} />
      <PageMetadata image={image}>
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content={`${props.categoryGeneratedIndex.title} | Miden Docs`}
        />
      </PageMetadata>
    </>
  );
}
