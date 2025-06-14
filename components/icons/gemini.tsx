import * as React from "react";

export function Gemini(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      fillRule="evenodd"
      style={{
        flex: "none",
        lineHeight: 1,
      }}
      viewBox="0 0 24 24"
      {...props}
    >
      <title>{"Gemini"}</title>
      <path d="M12 24A14.304 14.304 0 0 0 0 12 14.304 14.304 0 0 0 12 0a14.305 14.305 0 0 0 12 12 14.305 14.305 0 0 0-12 12" />
    </svg>
  );
}

export default Gemini;
