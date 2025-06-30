import type { ImgHTMLAttributes } from "react";

export function Logo(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="https://i.ibb.co/mrbQLXh/81bee260-c4b0-4782-a256-c6ab0fafb23e.png"
      alt="BeFast Logo"
      {...props}
    />
  );
}
