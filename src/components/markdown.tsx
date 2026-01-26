import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-li:my-0.5 prose-ol:my-2 prose-p:my-2 prose-ul:my-2",
        "prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        className
      )}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
