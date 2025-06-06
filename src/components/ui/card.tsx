import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * Card component
 * @param hover - If false, disables hover styles by adding 'no-hover' class. Default: true.
 */
function Card({
  className,
  hover = true,
  ...props
}: React.ComponentProps<"div"> & { hover?: boolean }): React.JSX.Element {
  return (
    <div
      data-slot="card"
      className={cn(
        // Tailwind equivalents for cartoon-card:
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border-4 border-black py-6 shadow-[0_8px_0_#000,0_8px_12px_0_rgba(0,0,0,0.25)] transition-[transform,box-shadow] duration-100 ease-in-out",
        hover &&
          "hover:-translate-y-0.5 hover:shadow-[0_10px_0_#000,0_14px_16px_0_rgba(0,0,0,0.3)]",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
