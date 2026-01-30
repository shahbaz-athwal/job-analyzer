"use client";

import { useMutation } from "convex/react";
import { Check, FileText, Loader2, Send, Upload, X } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
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
import { toast } from "@/components/ui/toast";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSheetState } from "@/hooks/use-sheet-state";
import { cn } from "@/lib/utils";

interface ApplySheetProps {
  jobId: Id<"jobs">;
  jobTitle: string;
  company: string;
  onSuccess: () => void;
}

export function ApplySheet({
  jobId,
  jobTitle,
  company,
  onSuccess,
}: ApplySheetProps) {
  const { isOpen, closeSheet } = useSheetState();
  const open = isOpen("apply");
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const submitApplication = useMutation(api.applications.submit);

  const formRef = useRef<HTMLFormElement>(null);
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
        toast.error("Failed to upload resume");
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
    disabled: isUploading || isSubmitting,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadedFile) {
      toast.error("Please upload your resume");
      return;
    }

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
      closeSheet();
      formRef.current?.reset();
      setUploadedFile(null);
      onSuccess();
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      formRef.current?.reset();
      setUploadedFile(null);
    }
  }, [open]);

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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeSheet();
    }
  };

  return (
    <Sheet onOpenChange={handleOpenChange} open={open}>
      <SheetPopup className="w-full max-w-lg" side="right">
        <SheetHeader>
          <SheetTitle>Apply for {jobTitle}</SheetTitle>
          <SheetDescription>
            Submit your application to {company}
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <Form
            className="space-y-5"
            id="apply-form"
            onSubmit={handleSubmit}
            ref={formRef}
          >
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>

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
                placeholder="Tell us why you're a great fit for this role..."
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
                    <Check className="size-4 text-green-500" />
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
                    (isSubmitting || isUploading) &&
                      "pointer-events-none opacity-50"
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
          <Button
            disabled={isSubmitting || !uploadedFile}
            form="apply-form"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Submit Application
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

interface ApplyTriggerProps {
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function ApplyTrigger({
  disabled,
  className,
  fullWidth,
}: ApplyTriggerProps) {
  const { openSheet } = useSheetState();

  return (
    <Button
      className={fullWidth ? cn("w-full", className) : className}
      disabled={disabled}
      onClick={() => openSheet("apply")}
      size="lg"
    >
      Apply Now
    </Button>
  );
}
