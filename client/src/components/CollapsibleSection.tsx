import { ReactNode, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  icon?: ReactNode
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
  icon,
}: CollapsibleSectionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? "section" : undefined}
      className={cn("w-full", className)}
    >
      <AccordionItem value="section" className="border-none">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2 pb-4">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

