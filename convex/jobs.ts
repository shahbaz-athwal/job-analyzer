import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  internalMutation,
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

// Internal: Seed 10 job postings with hard-coded data
export const seedJobs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const jobs = [
      {
        title: "Senior Full Stack Engineer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        type: "full-time" as const,
        description: `We're looking for a Senior Full Stack Engineer to join our growing team. 

**Responsibilities:**
- Design and develop scalable web applications using React and Node.js
- Collaborate with product managers and designers to implement new features
- Mentor junior developers and conduct code reviews
- Optimize application performance and database queries

**Requirements:**
- 5+ years of experience with JavaScript/TypeScript
- Strong proficiency in React, Next.js, and modern frontend frameworks
- Experience with Node.js, PostgreSQL, and REST APIs
- Excellent problem-solving and communication skills

**Benefits:**
- Competitive salary ($150k-$200k)
- Health, dental, and vision insurance
- Unlimited PTO
- Remote-friendly work environment`,
        isOpen: true,
        createdAt: Date.now(),
      },
      {
        title: "Product Designer",
        company: "DesignHub Studio",
        location: "New York, NY",
        type: "full-time" as const,
        description: `Join our design team to create beautiful, user-centered digital experiences.

**What you'll do:**
- Lead design projects from concept to delivery
- Create wireframes, prototypes, and high-fidelity mockups
- Conduct user research and usability testing
- Collaborate with engineers to ensure design quality

**Qualifications:**
- 3+ years of product design experience
- Proficiency in Figma, Sketch, or Adobe XD
- Strong portfolio demonstrating UX/UI design skills
- Understanding of design systems and accessibility standards

**Perks:**
- $120k-$150k salary
- Flexible work schedule
- Professional development budget
- Modern office in Manhattan`,
        isOpen: true,
        createdAt: Date.now() - 86_400_000,
      },
      {
        title: "DevOps Engineer",
        company: "CloudScale Systems",
        location: "Austin, TX",
        type: "full-time" as const,
        description: `We're seeking a DevOps Engineer to help build and maintain our cloud infrastructure.

**Key Responsibilities:**
- Manage AWS infrastructure using Terraform and CloudFormation
- Build and maintain CI/CD pipelines
- Monitor system performance and implement improvements
- Ensure security best practices across all environments

**Required Skills:**
- 4+ years of DevOps or SRE experience
- Strong knowledge of AWS, Docker, and Kubernetes
- Experience with infrastructure as code (Terraform, Ansible)
- Proficiency in Python or Go for automation

**We Offer:**
- Competitive compensation ($130k-$170k)
- Stock options
- Work-from-home flexibility
- Latest tools and equipment`,
        isOpen: true,
        createdAt: Date.now() - 172_800_000,
      },
      {
        title: "Mobile Developer (iOS/Android)",
        company: "AppVentures",
        location: "Remote",
        type: "full-time" as const,
        description: `Looking for a talented Mobile Developer to build next-generation mobile apps.

**What we need:**
- Develop and maintain iOS and Android applications
- Write clean, maintainable code following best practices
- Integrate with RESTful APIs and third-party services
- Optimize app performance and user experience

**Must Have:**
- 3+ years of mobile development experience
- Proficiency in Swift/Kotlin or React Native/Flutter
- Experience with mobile app architecture patterns
- Published apps in App Store or Google Play

**Benefits:**
- $110k-$140k base salary
- 100% remote work
- Home office stipend
- Annual company retreats`,
        isOpen: true,
        createdAt: Date.now() - 259_200_000,
      },
      {
        title: "Data Scientist",
        company: "Analytics Pro",
        location: "Boston, MA",
        type: "full-time" as const,
        description: `Join our data science team to derive insights from large datasets and build ML models.

**Responsibilities:**
- Analyze complex datasets to identify trends and patterns
- Build and deploy machine learning models
- Create data visualizations and dashboards
- Collaborate with stakeholders to solve business problems

**Requirements:**
- Master's degree in Data Science, Statistics, or related field
- 4+ years of experience in data science or analytics
- Strong Python skills (pandas, scikit-learn, TensorFlow)
- Experience with SQL and data warehousing

**Compensation:**
- $140k-$180k salary
- Annual bonus program
- Comprehensive benefits package
- Continuing education support`,
        isOpen: true,
        createdAt: Date.now() - 345_600_000,
      },
      {
        title: "Frontend Developer Intern",
        company: "StartupXYZ",
        location: "Seattle, WA",
        type: "internship" as const,
        description: `Summer internship opportunity for aspiring frontend developers.

**What you'll learn:**
- Build user interfaces with React and TypeScript
- Work on real production features
- Participate in agile development process
- Receive mentorship from senior engineers

**Qualifications:**
- Currently pursuing degree in Computer Science or related field
- Basic knowledge of HTML, CSS, and JavaScript
- Familiarity with React or Vue.js
- Passion for learning and problem-solving

**Internship Details:**
- 12-week summer program
- $35-$45 per hour
- Hybrid work model
- Potential for full-time offer`,
        isOpen: true,
        createdAt: Date.now() - 432_000_000,
      },
      {
        title: "Technical Writer",
        company: "DocuTech Solutions",
        location: "Denver, CO",
        type: "contract" as const,
        description: `6-month contract position for an experienced Technical Writer.

**Responsibilities:**
- Create and maintain API documentation
- Write user guides and tutorials
- Collaborate with engineers to document new features
- Improve existing documentation based on user feedback

**Required Experience:**
- 3+ years of technical writing experience
- Strong understanding of software development concepts
- Experience documenting APIs (REST, GraphQL)
- Proficiency with documentation tools (Markdown, Docusaurus, etc.)

**Contract Details:**
- 6-month contract with extension possibility
- $70-$90 per hour
- Remote work available
- Immediate start date`,
        isOpen: true,
        createdAt: Date.now() - 518_400_000,
      },
      {
        title: "QA Engineer",
        company: "Quality First Labs",
        location: "Portland, OR",
        type: "full-time" as const,
        description: `We're hiring a QA Engineer to ensure the quality of our software products.

**Key Duties:**
- Design and execute test plans and test cases
- Perform manual and automated testing
- Identify, document, and track bugs
- Work with development team to resolve issues

**Skills Needed:**
- 3+ years of QA or testing experience
- Experience with automated testing tools (Selenium, Cypress, Jest)
- Understanding of software development lifecycle
- Strong attention to detail and analytical skills

**Benefits:**
- $90k-$120k salary
- Health insurance and 401(k)
- Professional development opportunities
- Collaborative team environment`,
        isOpen: true,
        createdAt: Date.now() - 604_800_000,
      },
      {
        title: "Backend Engineer (Python)",
        company: "DataFlow Inc.",
        location: "Chicago, IL",
        type: "full-time" as const,
        description: `Looking for a Backend Engineer to build robust server-side applications.

**Responsibilities:**
- Design and implement RESTful APIs
- Optimize database queries and system performance
- Write clean, testable, and maintainable code
- Participate in architecture discussions

**Requirements:**
- 4+ years of backend development experience
- Strong proficiency in Python (Django or FastAPI)
- Experience with PostgreSQL or MongoDB
- Knowledge of microservices architecture

**We Offer:**
- $130k-$160k base salary
- Equity options
- Comprehensive health benefits
- Hybrid work model`,
        isOpen: true,
        createdAt: Date.now() - 691_200_000,
      },
      {
        title: "Marketing Coordinator",
        company: "BrandBoost Agency",
        location: "Los Angeles, CA",
        type: "part-time" as const,
        description: `Part-time Marketing Coordinator position for creative individual.

**What you'll do:**
- Manage social media accounts and content calendar
- Create engaging content for various platforms
- Assist with email marketing campaigns
- Track and report on marketing metrics

**Qualifications:**
- 2+ years of marketing or social media experience
- Excellent written and verbal communication skills
- Familiarity with social media management tools
- Basic graphic design skills (Canva, Adobe Creative Suite)

**Position Details:**
- Part-time (20-25 hours per week)
- $30-$40 per hour
- Flexible schedule
- Opportunity to work with diverse clients`,
        isOpen: true,
        createdAt: Date.now() - 777_600_000,
      },
    ];

    const jobIds: Id<"jobs">[] = [];
    for (const job of jobs) {
      const jobId = await ctx.db.insert("jobs", job);
      jobIds.push(jobId);
    }

    return { count: jobIds.length, jobIds };
  },
});
