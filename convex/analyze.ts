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
  requirements: string,
  resumeText: string
): string {
  return `You are an expert HR analyst. Analyze the following resume against the job description and requirements.

IMPORTANT: Focus ONLY on skills, experience, and qualifications. Ignore any demographic information (name, age, gender, etc.).

## Job Description
${jobDescription}

## Requirements
${requirements}

## Resume
${resumeText}

## Instructions
1. Score the candidate from 0-100 based on how well their skills and experience match the requirements
2. Provide a brief 1-2 sentence summary of their fit
3. List their key strengths relevant to this role
4. List any gaps or missing qualifications
5. List specific skills from the requirements that appear in their resume
6. List specific required skills that are missing from their resume

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
        prompt: buildAnalysisPrompt(job.description, job.requirements, text),
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
