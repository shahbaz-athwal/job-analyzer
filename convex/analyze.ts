"use node";
import { generateText, Output } from "ai";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { analysisModel } from "./lib/ai";
import { AnalysisSchema } from "./lib/schemas";

function buildAnalysisPrompt(jobDescription: string): string {
  return `You are an expert HR analyst. Analyze the attached resume PDF against the job description.

IMPORTANT: Focus ONLY on skills, experience, and qualifications. Ignore any demographic information (name, age, gender, etc.).

## Job Description
${jobDescription}

## Instructions
1. Score the candidate from 0-100 based on how well their skills and experience match the job requirements
2. Provide 3-4 concise bullet points summarizing the candidate's fit (include both positives and areas of concern)
3. List specific skills from the job description that appear in their resume
4. List specific required skills that are missing from their resume
5. Convert the resume to well-formatted markdown and add highlight markers around relevant content

## Highlight Marker Format
Use this exact syntax to mark highlighted content in the resume markdown:
- {{skill}}text{{/skill}} - For matched skills (skills that match job requirements)
- {{exp}}text{{/exp}} - For relevant work experience, responsibilities, and key achievements/metrics
- {{edu}}text{{/edu}} - For relevant education, certifications, or training

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
  - type: the highlight type (skill, exp, edu)
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

      // Get resume URL from storage
      const resumeUrl = await ctx.storage.getUrl(application.resumeFileId);
      if (!resumeUrl) throw new Error("Resume file not found");

      // Analyze with AI SDK - pass PDF directly to Gemini
      const { output: analysis } = await generateText({
        model: analysisModel,
        output: Output.object({
          schema: AnalysisSchema,
        }),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildAnalysisPrompt(job.description) },
              {
                type: "file",
                data: new URL(resumeUrl),
                mediaType: "application/pdf",
              },
            ],
          },
        ],
      });

      // Save results via mutation
      await ctx.runMutation(internal.applications.saveAnalysis, {
        applicationId: args.applicationId,
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
