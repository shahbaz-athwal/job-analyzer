"use client";

import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Briefcase,
  Check,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const jobTypeBadgeVariant = {
  "full-time": "default",
  "part-time": "secondary",
  contract: "outline",
  internship: "info",
} as const;

const jobTypeLabel = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
} as const;

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as Id<"jobs">;

  const job = useQuery(api.jobs.get, { id: jobId });
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const submitApplication = useMutation(api.applications.submit);

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    storageId: Id<"_storage">;
    name: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await response.json();
        setUploadedFile({ storageId, name: file.name });
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadedFile) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const coverLetter = formData.get("coverLetter") as string;

    if (!(name && email)) return;

    setIsSubmitting(true);
    try {
      await submitApplication({
        jobId,
        name,
        email,
        phone: phone || undefined,
        coverLetter: coverLetter || undefined,
        resumeFileId: uploadedFile.storageId,
        resumeFileName: uploadedFile.name,
      });
      router.push(`/jobs/${jobId}/apply/success`);
    } catch (error) {
      console.error("Submission failed:", error);
      setIsSubmitting(false);
    }
  };

  if (job === undefined) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-8 h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Briefcase />
              </EmptyMedia>
              <EmptyTitle>Job Not Found</EmptyTitle>
              <EmptyDescription>
                This position may have been removed or is no longer available.
              </EmptyDescription>
            </EmptyHeader>
            <Button render={<Link href="/jobs" />}>
              <ArrowLeft className="size-4" />
              Back to Jobs
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link
        className="mb-6 inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
        href="/jobs"
      >
        <ArrowLeft className="size-4" />
        Back to all jobs
      </Link>

      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">{job.title}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{job.company}</p>
          </div>
          <Badge size="lg" variant={jobTypeBadgeVariant[job.type]}>
            {jobTypeLabel[job.type]}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>About this role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          {showForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Apply for this position</CardTitle>
                <CardDescription>
                  Fill out the form below to submit your application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form onSubmit={handleSubmit}>
                  <Field name="name">
                    <FieldLabel>
                      Full Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      disabled={isSubmitting}
                      placeholder="John Doe"
                      required
                    />
                  </Field>

                  <Field name="email">
                    <FieldLabel>
                      Email <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      disabled={isSubmitting}
                      placeholder="john@example.com"
                      required
                      type="email"
                    />
                  </Field>

                  <Field name="phone">
                    <FieldLabel>Phone</FieldLabel>
                    <Input
                      disabled={isSubmitting}
                      placeholder="+1 (555) 000-0000"
                      type="tel"
                    />
                  </Field>

                  <Field name="coverLetter">
                    <FieldLabel>Cover Letter</FieldLabel>
                    <Textarea
                      className="min-h-24"
                      disabled={isSubmitting}
                      placeholder="Tell us why you're a great fit..."
                    />
                  </Field>

                  <Field name="resume">
                    <FieldLabel>
                      Resume <span className="text-destructive">*</span>
                    </FieldLabel>
                    {uploadedFile ? (
                      <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-primary" />
                          <span className="truncate text-sm">
                            {uploadedFile.name}
                          </span>
                        </div>
                        <Button
                          disabled={isSubmitting}
                          onClick={() => setUploadedFile(null)}
                          size="icon-xs"
                          type="button"
                          variant="ghost"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        {...getRootProps()}
                        className={cn(
                          "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                          isDragActive
                            ? "border-primary bg-primary/5"
                            : "border-input hover:border-primary/50",
                          isSubmitting && "pointer-events-none opacity-50"
                        )}
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-2">
                          {isUploading ? (
                            <Loader2 className="size-8 animate-spin text-muted-foreground" />
                          ) : (
                            <Upload className="size-8 text-muted-foreground" />
                          )}
                          <div className="text-sm">
                            <span className="font-medium text-primary">
                              Upload PDF
                            </span>{" "}
                            <span className="text-muted-foreground">
                              or drag and drop
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Field>

                  <Button
                    className="w-full"
                    disabled={isSubmitting || !uploadedFile}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="size-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Interested?</CardTitle>
                <CardDescription>
                  Apply now and get matched instantly with AI analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {job.isOpen ? (
                  <Button
                    className="w-full"
                    onClick={() => setShowForm(true)}
                    size="lg"
                  >
                    Apply Now
                  </Button>
                ) : (
                  <div className="rounded-lg bg-muted p-4 text-center text-muted-foreground text-sm">
                    This position is no longer accepting applications.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
