"use client";

import { useMutation } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";

type JobType = "full-time" | "part-time" | "contract" | "internship";

interface CreateJobSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJobSheet({ open, onOpenChange }: CreateJobSheetProps) {
  const router = useRouter();
  const createJob = useMutation(api.jobs.create);
  const formRef = useRef<HTMLFormElement>(null);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<JobType>("full-time");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setLocation("");
    setType("full-time");
    setDescription("");
    setRequirements("");
  };

  const isFormValid =
    title && company && location && description && requirements;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const jobId = await createJob({
        title,
        company,
        location,
        type,
        description,
        requirements,
      });
      onOpenChange(false);
      resetForm();
      router.push(`/dashboard/jobs/${jobId}`);
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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger render={<Button />}>
        <Plus className="size-4" />
        Create Job
      </SheetTrigger>
      <SheetPopup className="w-full max-w-xl" side="right">
        <SheetHeader>
          <SheetTitle>Create New Job</SheetTitle>
          <SheetDescription>
            Fill out the details for your new job posting.
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <form
            className="space-y-6"
            id="create-job-form"
            onSubmit={handleSubmit}
            ref={formRef}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="font-medium text-sm" htmlFor="title">
                  Job Title *
                </label>
                <Input
                  id="title"
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  required
                  value={title}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium text-sm" htmlFor="company">
                  Company *
                </label>
                <Input
                  id="company"
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                  value={company}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium text-sm" htmlFor="location">
                  Location *
                </label>
                <Input
                  id="location"
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA / Remote"
                  required
                  value={location}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium text-sm" htmlFor="job-type">
                  Job Type *
                </label>
                <Select
                  onValueChange={(v) => setType(v as JobType)}
                  value={type}
                >
                  <SelectTrigger id="job-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectPopup>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="description">
                Job Description *
              </label>
              <Textarea
                className="min-h-28"
                id="description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, and what makes it exciting..."
                required
                value={description}
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="requirements">
                Requirements *
              </label>
              <Textarea
                className="min-h-28"
                id="requirements"
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="List required skills, experience, and qualifications..."
                required
                value={requirements}
              />
              <p className="text-muted-foreground text-xs">
                Be specific about required skills for better AI matching.
              </p>
            </div>
          </form>
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
          <Button
            disabled={isSubmitting || !isFormValid}
            form="create-job-form"
            type="submit"
          >
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
