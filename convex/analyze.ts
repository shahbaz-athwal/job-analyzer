"use node";
import { generateText, Output } from "ai";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { analysisModel } from "./lib/ai";
import { extractTextFromPdf } from "./lib/pdf";
import { AnalysisSchema } from "./lib/schemas";

function buildAnalysisPrompt(
  jobDescription: string,
  resumeText: string
): string {
  return `You are an expert HR analyst. Analyze the following resume against the job description.

IMPORTANT: Focus ONLY on skills, experience, and qualifications. Ignore any demographic information (name, age, gender, etc.).

## Job Description
${jobDescription}

## Resume
${resumeText}

## Instructions
1. Score the candidate from 0-100 based on how well their skills and experience match the job requirements
2. Provide a brief 1-2 sentence summary of their fit
3. List their key strengths relevant to this role
4. List any gaps or missing qualifications
5. List specific skills from the job description that appear in their resume
6. List specific required skills that are missing from their resume
7. Convert the resume to well-formatted markdown and add highlight markers around relevant content

## Highlight Marker Format
Use this exact syntax to mark highlighted content in the resume markdown:
- {{skill}}text{{/skill}} - For matched skills (skills that match job requirements)
- {{exp}}text{{/exp}} - For relevant work experience and responsibilities
- {{edu}}text{{/edu}} - For relevant education, certifications, or training
- {{ach}}text{{/ach}} - For key achievements, metrics, or accomplishments

## Resume Markdown Guidelines
- Format the resume as clean, readable markdown with proper headings (##, ###)
- CRITICAL: Each bullet point MUST be on its own line starting with "- " (hyphen and space)
- Add a blank line before starting a bullet list
- Do NOT combine multiple bullet points into a single paragraph
- Convert em-dashes (–) or other bullet characters to standard markdown hyphens (-)
- Preserve the original structure and content of the resume
- Add highlight markers INLINE around the specific relevant text (not entire sections)
- Each highlight should wrap a specific phrase or sentence, not large blocks
- For the highlightedSections array, include EVERY highlighted item with:
  - type: the highlight type (skill, exp, edu, ach)
  - text: the EXACT text that appears between the markers
  - reason: a brief explanation of why it's relevant to the job

Be objective and thorough in your analysis.`;
}

export const analyzeApplication = internalAction({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    // Update status to processing
    await ctx.runMutation(internal.applications.updateStatus, {
      applicationId: args.applicationId,
      status: "processing",
    });

    try {
      // Get application and job data
      const application = await ctx.runQuery(
        internal.applications.getInternal,
        {
          id: args.applicationId,
        }
      );
      const job = await ctx.runQuery(internal.jobs.getInternal, {
        id: application.jobId,
      });

      // Fetch resume PDF from storage
      const blob = await ctx.storage.get(application.resumeFileId);
      if (!blob) throw new Error("Resume file not found");

      // Extract text from PDF
      const text = await extractTextFromPdf(blob);

      // Analyze with AI SDK
      const { output: analysis } = await generateText({
        model: analysisModel,
        output: Output.object({
          schema: AnalysisSchema,
        }),
        prompt: buildAnalysisPrompt(job.description, text),
      });

      // Save results via mutation
      await ctx.runMutation(internal.applications.saveAnalysis, {
        applicationId: args.applicationId,
        extractedText: text,
        analysis,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      await ctx.runMutation(internal.applications.updateStatus, {
        applicationId: args.applicationId,
        status: "error",
      });
    }
  },
});
