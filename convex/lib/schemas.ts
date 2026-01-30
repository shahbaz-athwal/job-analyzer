import { z } from "zod";

// Highlight types for annotating resume content
export const HighlightType = z.enum(["skill", "exp", "edu"]);

export const HighlightedSectionSchema = z.object({
  type: HighlightType.describe(
    "Type of highlight: skill (matched skill), exp (relevant experience), edu (relevant education)"
  ),
  text: z
    .string()
    .describe("The exact text that was highlighted in the resume"),
  reason: z.string().describe("Brief explanation of why this was highlighted"),
});

export const AnalysisSchema = z.object({
  score: z.number().min(0).max(100).describe("Match score from 0-100"),
  strengths: z
    .array(z.string())
    .min(1)
    .max(2)
    .describe(
      "1-2 key strengths. Use **bold** markdown for the most important phrase in each point."
    ),
  risks: z
    .array(z.string())
    .min(1)
    .max(2)
    .describe(
      "1-2 concerns or gaps. Use **bold** markdown for the key issue in each point."
    ),
  matchedSkills: z
    .array(z.string())
    .describe("Skills from job requirements found in resume"),
  missingSkills: z
    .array(z.string())
    .describe("Required skills not found in resume"),
  resumeMarkdown: z
    .string()
    .describe(
      "Resume content in markdown format with highlight markers using {{type}}text{{/type}} syntax"
    ),
  highlightedSections: z
    .array(HighlightedSectionSchema)
    .describe("List of all highlighted sections with their types and reasons"),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
export type HighlightedSection = z.infer<typeof HighlightedSectionSchema>;
