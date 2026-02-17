"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectForm } from "./project-form";

interface NewProjectDialogProps {
  clients: { id: string; company_name: string }[];
  userId: string;
  defaultRate?: number | null;
  trigger?: React.ReactNode;
}

export function NewProjectDialog({
  clients,
  userId,
  defaultRate,
  trigger,
}: NewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      )}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Create a new project to track your work.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm
          clients={clients}
          userId={userId}
          defaultRate={defaultRate}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
