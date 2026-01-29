import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

// Public: Submit a new application
export const submit = mutation({
  args: {
    jobId: v.id("jobs"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    coverLetter: v.optional(v.string()),
    resumeFileId: v.id("_storage"),
    resumeFileName: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify the job exists and is open
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    if (!job.isOpen) throw new Error("Job is no longer accepting applications");

    // Create the application
    const applicationId = await ctx.db.insert("applications", {
      ...args,
      status: "submitted",
      submittedAt: Date.now(),
    });

    // Schedule AI analysis
    await ctx.scheduler.runAfter(0, internal.analyze.analyzeApplication, {
      applicationId,
    });

    return applicationId;
  },
});

// Internal: Get application (for use in actions)
export const getInternal = internalQuery({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) throw new Error("Application not found");
    return application;
  },
});

// Internal: Update application status
export const updateStatus = internalMutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("submitted"),
      v.literal("processing"),
      v.literal("reviewed"),
      v.literal("error")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.applicationId, { status: args.status });
  },
});

// Internal: Save analysis results
export const saveAnalysis = internalMutation({
  args: {
    applicationId: v.id("applications"),
    extractedText: v.string(),
    analysis: v.object({
      score: v.number(),
      summary: v.string(),
      strengths: v.array(v.string()),
      weaknesses: v.array(v.string()),
      matchedSkills: v.array(v.string()),
      missingSkills: v.array(v.string()),
      // Highlighted resume content
      resumeMarkdown: v.optional(v.string()),
      highlightedSections: v.optional(
        v.array(
          v.object({
            type: v.union(
              v.literal("skill"),
              v.literal("exp"),
              v.literal("edu")
            ),
            text: v.string(),
            reason: v.string(),
          })
        )
      ),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.applicationId, {
      extractedText: args.extractedText,
      analysis: args.analysis,
      status: "reviewed",
    });
  },
});

// Recruiter: List applications for a job (sorted by score)
export const listByJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    // Sort by score (highest first), with unscored at the end
    return applications.sort((a, b) => {
      const scoreA = a.analysis?.score ?? -1;
      const scoreB = b.analysis?.score ?? -1;
      return scoreB - scoreA;
    });
  },
});

// Recruiter: Get a single application with details
export const get = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) return null;

    // Get the job details too
    const job = await ctx.db.get(application.jobId);

    // Get resume URL
    const resumeUrl = await ctx.storage.getUrl(application.resumeFileId);

    return {
      ...application,
      job,
      resumeUrl,
    };
  },
});
