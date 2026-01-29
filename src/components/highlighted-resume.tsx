"use client";

import { useEffect, useMemo, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import {
  RoughNotation,
  RoughNotationGroup,
  type types,
} from "react-rough-notation";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

// Type alias for rough notation types
type RoughNotationType = types;

// Highlight configuration for each type
const HIGHLIGHT_CONFIG: Record<
  string,
  {
    type: RoughNotationType;
    color: string;
    label: string;
    strokeWidth?: number;
    multiline?: boolean;
  }
> = {
  skill: {
    type: "highlight",
    color: "#FDE047", // Yellow
    label: "Matched Skill",
    multiline: true,
  },
  exp: {
    type: "underline",
    color: "#3B82F6", // Blue
    label: "Relevant Experience",
    strokeWidth: 2,
  },
  edu: {
    type: "box",
    color: "#22C55E", // Green
    label: "Education",
    strokeWidth: 2,
  },
  ach: {
    type: "circle",
    color: "#A855F7", // Purple
    label: "Achievement",
    strokeWidth: 2,
  },
};

// Regex to match highlight markers
const HIGHLIGHT_REGEX = /\{\{(skill|exp|edu|ach)\}\}([\s\S]*?)\{\{\/\1\}\}/g;

interface HighlightedSection {
  type: "skill" | "exp" | "edu" | "ach";
  text: string;
  reason: string;
}

interface HighlightedResumeProps {
  markdown: string;
  highlightedSections?: HighlightedSection[];
  className?: string;
  showLegend?: boolean;
  animationDelay?: number;
}

// Preprocess markdown to convert {{type}}text{{/type}} to HTML mark elements
function preprocessMarkdown(markdown: string): string {
  return markdown.replace(
    HIGHLIGHT_REGEX,
    (_match, type, content) =>
      `<mark data-highlight="${type}">${content}</mark>`
  );
}

// Component to render highlighted text with Rough Notation
function HighlightedMark({
  children,
  type,
  show,
  reason,
}: {
  children: React.ReactNode;
  type: string;
  show: boolean;
  reason?: string;
}) {
  const config = HIGHLIGHT_CONFIG[type] || HIGHLIGHT_CONFIG.skill;

  return (
    <RoughNotation
      animate
      animationDuration={400}
      color={config.color}
      multiline={config.multiline}
      show={show}
      strokeWidth={config.strokeWidth || 1}
      type={config.type}
    >
      <span className="relative" title={reason}>
        {children}
      </span>
    </RoughNotation>
  );
}

// Legend component showing highlight types
function HighlightLegend() {
  return (
    <div className="mb-4 flex flex-wrap gap-4 rounded-lg border bg-muted/50 p-3">
      <span className="font-medium text-muted-foreground text-sm">Legend:</span>
      {Object.entries(HIGHLIGHT_CONFIG).map(([key, config]) => (
        <div className="flex items-center gap-2" key={key}>
          <span
            className="size-3 rounded-sm"
            style={{ backgroundColor: config.color }}
          />
          <span className="text-sm">{config.label}</span>
        </div>
      ))}
    </div>
  );
}

export function HighlightedResume({
  markdown,
  highlightedSections = [],
  className,
  showLegend = true,
  animationDelay = 500,
}: HighlightedResumeProps) {
  const [showAnnotations, setShowAnnotations] = useState(false);

  // Build a map of highlighted text to reasons
  const highlightReasons = useMemo(() => {
    const map = new Map<string, string>();
    for (const section of highlightedSections) {
      map.set(section.text, section.reason);
    }
    return map;
  }, [highlightedSections]);

  // Preprocess markdown to convert markers to HTML
  const processedMarkdown = useMemo(
    () => preprocessMarkdown(markdown),
    [markdown]
  );

  // Start animations after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnnotations(true);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animationDelay]);

  // Create custom markdown components
  const components: Components = useMemo(
    () => ({
      // Handle the mark elements we created
      mark: ({ node, children }) => {
        const highlightType =
          (node?.properties?.dataHighlight as string) || "skill";

        // Try to find the reason for this highlight
        let textContent = "";
        if (typeof children === "string") {
          textContent = children;
        } else if (Array.isArray(children)) {
          textContent = children
            .filter((c): c is string => typeof c === "string")
            .join("");
        }
        const reason = highlightReasons.get(textContent);

        return (
          <HighlightedMark
            reason={reason}
            show={showAnnotations}
            type={highlightType}
          >
            {children}
          </HighlightedMark>
        );
      },
    }),
    [highlightReasons, showAnnotations]
  );

  return (
    <div className={className}>
      {showLegend && <HighlightLegend />}
      <RoughNotationGroup show={showAnnotations}>
        <div
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none",
            "prose-li:my-0.5 prose-ol:my-2 prose-p:my-2 prose-ul:my-2",
            "prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold",
            "prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          )}
        >
          <ReactMarkdown components={components} rehypePlugins={[rehypeRaw]}>
            {processedMarkdown}
          </ReactMarkdown>
        </div>
      </RoughNotationGroup>
    </div>
  );
}

// Export highlight config for use in other components
export { HIGHLIGHT_CONFIG };
export type { HighlightedSection };
