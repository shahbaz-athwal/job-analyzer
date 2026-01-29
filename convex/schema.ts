import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Jobs table - created by recruiters
  jobs: defineTable({
    title: v.string(),
    company: v.string(),
    location: v.string(),
    type: v.union(
      v.literal("full-time"),
      v.literal("part-time"),
      v.literal("contract"),
      v.literal("internship")
    ),
    description: v.string(),
    isOpen: v.boolean(),
    createdAt: v.number(),
  }).index("by_open", ["isOpen"]),

  // Applications table - submitted by candidates
  applications: defineTable({
    jobId: v.id("jobs"),

    // Applicant info (from form)
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    coverLetter: v.optional(v.string()),

    // Resume
    resumeFileId: v.id("_storage"),
    resumeFileName: v.string(),
    extractedText: v.optional(v.string()),

    // AI Analysis results
    analysis: v.optional(
      v.object({
        score: v.number(),
        summary: v.string(),
        strengths: v.array(v.string()),
        weaknesses: v.array(v.string()),
        matchedSkills: v.array(v.string()),
        missingSkills: v.array(v.string()),
        // Highlighted resume in markdown format
        resumeMarkdown: v.optional(v.string()),
        highlightedSections: v.optional(
          v.array(
            v.object({
              type: v.union(
                v.literal("skill"),
                v.literal("exp"),
                v.literal("edu"),
                v.literal("ach")
              ),
              text: v.string(),
              reason: v.string(),
            })
          )
        ),
      })
    ),

    // Status tracking
    status: v.union(
      v.literal("submitted"),
      v.literal("processing"),
      v.literal("reviewed"),
      v.literal("error")
    ),

    submittedAt: v.number(),
  })
    .index("by_job", ["jobId"])
    .index("by_job_and_status", ["jobId", "status"]),
});
