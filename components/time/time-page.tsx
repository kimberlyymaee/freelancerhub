"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualEntry } from "./manual-entry";
import { Timer } from "./timer";
import { TimesheetView } from "./timesheet-view";
import type { TimeEntry, Project } from "@/lib/types";

interface TimePageProps {
  projects: (Pick<Project, "id" | "name"> & {
    client: { company_name: string } | null;
  })[];
  timeEntries: (TimeEntry & {
    project: Pick<Project, "id" | "name"> & {
      client: { company_name: string } | null;
    };
  })[];
  userId: string;
}

export function TimePage({ projects, timeEntries, userId }: TimePageProps) {
  const router = useRouter();
  const [entries, setEntries] = useState(timeEntries);

  function handleNewEntry() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Timer + Manual Entry */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Timer projects={projects} userId={userId} onSave={handleNewEntry} />
        <ManualEntry
          projects={projects}
          userId={userId}
          onSave={handleNewEntry}
        />
      </div>

      {/* Timesheet */}
      <TimesheetView entries={entries} />
    </div>
  );
}
