import Link from "next/link";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm shadow-orange-500/25 active:scale-[0.98]",
        secondary:
          "bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-[0.98]",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs active:scale-[0.98]",
        ghost:
          "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        link: "text-orange-600 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-3.5 text-xs font-semibold rounded-lg",
        md: "h-10 px-5 text-sm font-semibold rounded-lg",
        lg: "h-12 px-7 text-base font-semibold rounded-xl",
        xl: "h-14 px-9 text-base font-bold rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
}

export function Button({
  className,
  variant,
  size,
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export { buttonVariants };
