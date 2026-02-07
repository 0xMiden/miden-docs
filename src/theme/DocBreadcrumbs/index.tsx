import React, { type ReactNode } from "react";
import DocBreadcrumbs from "@theme-original/DocBreadcrumbs";
import type DocBreadcrumbsType from "@theme/DocBreadcrumbs";
import type { WrapperProps } from "@docusaurus/types";
import CopyPageButton from "@site/src/components/CopyPageButton";
import styles from "./styles.module.css";

type Props = WrapperProps<typeof DocBreadcrumbsType>;

export default function DocBreadcrumbsWrapper(props: Props): ReactNode {
  return (
    <div className={styles.breadcrumbRow}>
      <DocBreadcrumbs {...props} />
      <CopyPageButton />
    </div>
  );
}
