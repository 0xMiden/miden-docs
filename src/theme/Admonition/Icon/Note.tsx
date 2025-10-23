import React, { type ReactNode } from "react";
import type { Props } from "@theme/Admonition/Icon/Note";

export default function AdmonitionIconNote(props: Props): ReactNode {
  return (
    <svg
      width="9"
      height="10"
      viewBox="0 0 9 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0H9V7H8V8H7V7H6V8H7V9H6V10H0V0ZM1 1V9H5V6H8V1H1Z"
        fill="#FF5500"
      />
    </svg>
  );
}
