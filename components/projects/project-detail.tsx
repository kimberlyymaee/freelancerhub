"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import type { Project, TimeEntry } from "@/lib/types";
import { ProjectForm } from "./project-form";

interface ProjectDetailProps {
  project: Project & { client?: { id: string; company_name: string } | null };
  clients: { id: string; company_name: string }[];
  timeEntries: TimeEntry[];
  userId: string;
  defaultRate?: number | null;
}

export function ProjectDetail({
  project,
  clients,
  timeEntries,
  userId,
  defaultRate,
}: ProjectDetailProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
  const billableHours = timeEntries
    .filter((e) => e.is_billable)
    .reduce((sum, e) => sum + e.hours, 0);
  const totalBilled = billableHours * (project.rate || 0);
  const budgetUsed = project.estimated_hours
    ? (totalHours / project.estimated_hours) * 100
    : 0;

  async function handleDelete() {
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      toast.error("Failed to delete project: " + error.message);
    } else {
      toast.success("Project deleted");
      router.push("/projects");
      router.refresh();
    }
  }

  function formatStatus(status: string): string {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  if (editing) {
    return (
      <div className="max-w-lg">
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
        <ProjectForm
          clients={clients}
          userId={userId}
          defaultRate={defaultRate}
          project={project}
          onSuccess={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Info */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="secondary"
                className={STATUS_COLORS[project.status] || ""}
              >
                {formatStatus(project.status)}
              </Badge>
              <Badge variant="outline">{project.type}</Badge>
              {project.client && (
                <span className="text-sm text-muted-foreground">
                  {project.client.company_name}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {project.description}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-lg font-bold">{totalHours.toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Billed</p>
              <p className="text-lg font-bold">{formatCurrency(totalBilled)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rate</p>
              <p className="text-lg font-bold">
                {project.rate ? formatCurrency(project.rate) + "/hr" : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget Used</p>
              <p className="text-lg font-bold">
                {project.estimated_hours
                  ? `${budgetUsed.toFixed(0)}%`
                  : "-"}
              </p>
            </div>
          </div>
          {project.deadline && (
            <p className="text-sm text-muted-foreground mt-4">
              Deadline: {formatDate(project.deadline)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Time Entries ({timeEntries.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/time")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Log Time
          </Button>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No time entries yet.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead>Billable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{entry.description || "-"}</TableCell>
                      <TableCell className="text-right">
                        {entry.hours.toFixed(1)}h
                      </TableCell>
                      <TableCell>
                        {entry.is_billable ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{project.name}&quot;?
              This will also delete all time entries for this project.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
