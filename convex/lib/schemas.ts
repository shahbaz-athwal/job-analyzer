import { z } from "zod";

export const AnalysisSchema = z.object({
	score: z.number().min(0).max(100).describe("Match score from 0-100"),
	summary: z
		.string()
		.describe("Brief 1-2 sentence summary of the candidate fit"),
	strengths: z
		.array(z.string())
		.describe("List of strengths matching job requirements"),
	weaknesses: z
		.array(z.string())
		.describe("List of gaps or missing qualifications"),
	matchedSkills: z
		.array(z.string())
		.describe("Skills from job requirements found in resume"),
	missingSkills: z
		.array(z.string())
		.describe("Required skills not found in resume"),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
