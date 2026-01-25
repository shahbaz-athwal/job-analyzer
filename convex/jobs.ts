import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
	internalQuery,
	mutation,
	type QueryCtx,
	query,
} from "./_generated/server";

// Helper to get application count for a job
async function getApplicationCount(ctx: QueryCtx, jobId: Id<"jobs">) {
	const applications = await ctx.db
		.query("applications")
		.withIndex("by_job", (q) => q.eq("jobId", jobId))
		.collect();
	return applications.length;
}

// Public: List all open jobs
export const listOpen = query({
	args: {},
	handler: async (ctx) => {
		const jobs = await ctx.db
			.query("jobs")
			.withIndex("by_open", (q) => q.eq("isOpen", true))
			.order("desc")
			.collect();

		return jobs;
	},
});

// Public: Get a single job by ID
export const get = query({
	args: { id: v.id("jobs") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

// Internal: Get job (for use in actions)
export const getInternal = internalQuery({
	args: { id: v.id("jobs") },
	handler: async (ctx, args) => {
		const job = await ctx.db.get(args.id);
		if (!job) throw new Error("Job not found");
		return job;
	},
});

// Recruiter: List all jobs with application counts
export const listAll = query({
	args: {},
	handler: async (ctx) => {
		const jobs = await ctx.db.query("jobs").order("desc").collect();

		const jobsWithCounts = await Promise.all(
			jobs.map(async (job) => ({
				...job,
				applicationCount: await getApplicationCount(ctx, job._id),
			}))
		);

		return jobsWithCounts;
	},
});

// Recruiter: Create a new job
export const create = mutation({
	args: {
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
		requirements: v.string(),
	},
	handler: async (ctx, args) => {
		const jobId = await ctx.db.insert("jobs", {
			...args,
			isOpen: true,
			createdAt: Date.now(),
		});
		return jobId;
	},
});

// Recruiter: Update a job
export const update = mutation({
	args: {
		id: v.id("jobs"),
		title: v.optional(v.string()),
		company: v.optional(v.string()),
		location: v.optional(v.string()),
		type: v.optional(
			v.union(
				v.literal("full-time"),
				v.literal("part-time"),
				v.literal("contract"),
				v.literal("internship")
			)
		),
		description: v.optional(v.string()),
		requirements: v.optional(v.string()),
		isOpen: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;

		// Filter out undefined values
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, value]) => value !== undefined)
		);

		await ctx.db.patch(id, filteredUpdates);
	},
});

// Recruiter: Delete a job
export const remove = mutation({
	args: { id: v.id("jobs") },
	handler: async (ctx, args) => {
		// Delete all applications for this job first
		const applications = await ctx.db
			.query("applications")
			.withIndex("by_job", (q) => q.eq("jobId", args.id))
			.collect();

		for (const app of applications) {
			// Delete the resume file
			await ctx.storage.delete(app.resumeFileId);
			await ctx.db.delete(app._id);
		}

		await ctx.db.delete(args.id);
	},
});
