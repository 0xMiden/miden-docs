import React, { type ReactNode } from "react";
import Category from "@theme-original/DocSidebarItem/Category";
import type CategoryType from "@theme/DocSidebarItem/Category";
import type { WrapperProps } from "@docusaurus/types";

type Props = WrapperProps<typeof CategoryType>;

export default function CategoryWrapper(props: Props): ReactNode {
  return <Category {...props} />;
}
