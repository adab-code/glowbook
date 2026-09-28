import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";
import { cn } from "@/lib/utils/format";

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-[13px] font-medium text-neutral-800 select-none",
        className,
      )}
      {...props}
    />
  );
}
