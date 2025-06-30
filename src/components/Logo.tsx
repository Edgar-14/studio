import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1.5em"
      height="1.5em"
      {...props}
    >
      <path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm-8 168v-60H84a12 12 0 0 1 0-24h36V88a36 36 0 0 1 72 0v12h4a12 12 0 0 1 0 24h-4v28a12 12 0 0 1-24 0v-28h-32v80a12 12 0 0 1-24 0Zm48-104a12 12 0 0 1-12-12v-4a12 12 0 0 1 24 0v4a12 12 0 0 1-12 12Z" />
    </svg>
  );
}
