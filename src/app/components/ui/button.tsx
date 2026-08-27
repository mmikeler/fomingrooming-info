import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  href?: string;
}

export default function Button({
  className = "",
  children,
  href,
  ...props
}: ButtonProps) {
  const classNameStr = `btn px-3 py-4 lg:px-7.5 lg:py-5 block ${className}`;

  if (href) {
    return (
      <Link href={href} className={classNameStr} role="button">
        {children}
      </Link>
    );
  }

  return (
    <button role="button" {...props} className={classNameStr}>
      {children}
    </button>
  );
}
