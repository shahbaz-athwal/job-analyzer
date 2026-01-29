"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
};

// Regex to match highlight markers
const HIGHLIGHT_REGEX = /\{\{(skill|exp|edu)\}\}([\s\S]*?)\{\{\/\1\}\}/g;

interface HighlightedSection {
  type: "skill" | "exp" | "edu";
  text: string;
  reason: string;
}

interface HighlightedResumeProps {
  markdown: string;
  highlightedSections?: HighlightedSection[];
  className?: string;
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
  index,
}: {
  children: React.ReactNode;
  type: string;
  show: boolean;
  reason?: string;
  index: number;
}) {
  const config = HIGHLIGHT_CONFIG[type] || HIGHLIGHT_CONFIG.skill;

  return (
    <RoughNotation
      animate
      animationDelay={index * 200}
      animationDuration={600}
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

export function HighlightedResume({
  markdown,
  highlightedSections = [],
  className,
  animationDelay = 500,
}: HighlightedResumeProps) {
  const [showAnnotations, setShowAnnotations] = useState(false);
  const highlightIndexRef = useRef(0);

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

  // Reset highlight index counter when markdown changes or annotations are toggled
  useEffect(() => {
    highlightIndexRef.current = 0;
  }, [processedMarkdown, showAnnotations]);

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

        const currentIndex = highlightIndexRef.current++;

        return (
          <HighlightedMark
            index={currentIndex}
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
