"use client";

import { useMutation } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useSheetState } from "@/hooks/use-sheet-state";

type JobType = "full-time" | "part-time" | "contract" | "internship";

export function CreateJobSheet() {
  const router = useRouter();
  const { isOpen, closeSheet } = useSheetState();
  const open = isOpen("create-job");

  const createJob = useMutation(api.jobs.create);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeSheet();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const title = formData.get("title") as string;
    const company = formData.get("company") as string;
    const location = formData.get("location") as string;
    const type = (formData.get("type") as JobType) || "full-time";
    const description = formData.get("description") as string;

    if (!(title && company && location && description)) return;

    setIsSubmitting(true);
    try {
      const jobId = await createJob({
        title,
        company,
        location,
        type,
        description,
      });
      closeSheet();
      formRef.current?.reset();
      router.push(`/jobs/${jobId}`);
    } catch (error) {
      console.error("Failed to create job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open && (e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <Sheet onOpenChange={handleOpenChange} open={open}>
      <SheetPopup className="w-full max-w-xl" side="right">
        <SheetHeader>
          <SheetTitle>Create New Job</SheetTitle>
          <SheetDescription>
            Fill out the details for your new job posting.
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <Form
            className="space-y-6"
            id="create-job-form"
            onSubmit={handleSubmit}
            ref={formRef}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="title">
                <FieldLabel>
                  Job Title <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  disabled={isSubmitting}
                  placeholder="e.g. Senior Software Engineer"
                  required
                  type="text"
                />
              </Field>

              <Field name="company">
                <FieldLabel>
                  Company <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  disabled={isSubmitting}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </Field>

              <Field name="location">
                <FieldLabel>
                  Location <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  disabled={isSubmitting}
                  placeholder="e.g. San Francisco, CA / Remote"
                  required
                />
              </Field>

              <Field name="type">
                <FieldLabel>
                  Job Type <span className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  defaultValue="full-time"
                  disabled={isSubmitting}
                  name="type"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectPopup>
                </Select>
              </Field>
            </div>

            <Field name="description">
              <FieldLabel>
                Job Description <span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea
                className="min-h-36"
                disabled={isSubmitting}
                placeholder="Describe the role, responsibilities, required skills, and qualifications..."
                required
              />
              <FieldDescription>
                Include role details, requirements, and qualifications for
                better AI matching.
              </FieldDescription>
            </Field>
          </Form>
        </SheetPanel>
        <SheetFooter>
          <SheetClose
            aria-keyshortcuts="Escape"
            render={
              <Button variant="outline">
                Cancel
                <KbdGroup className="ml-1.5 hidden sm:inline-flex">
                  <Kbd>Esc</Kbd>
                </KbdGroup>
              </Button>
            }
          >
            Cancel
          </SheetClose>
          <Button disabled={isSubmitting} form="create-job-form" type="submit">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Create Job
                <KbdGroup className="ml-1.5 hidden invert sm:inline-flex">
                  <Kbd>⌘ + ↵</Kbd>
                </KbdGroup>
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  );
}

export function CreateJobTrigger() {
  const { openSheet } = useSheetState();

  return (
    <Button onClick={() => openSheet("create-job")}>
      <Plus className="size-4" />
      Create Job
    </Button>
  );
}
