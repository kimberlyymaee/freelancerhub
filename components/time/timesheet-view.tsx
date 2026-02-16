"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { TimeEntry, Project } from "@/lib/types";

interface TimesheetViewProps {
  entries: (TimeEntry & {
    project: Pick<Project, "id" | "name"> & {
      client: { company_name: string } | null;
    };
  })[];
}

export function TimesheetView({ entries }: TimesheetViewProps) {
  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const billableHours = entries
    .filter((e) => e.is_billable)
    .reduce((sum, e) => sum + e.hours, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Entries</CardTitle>
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">
            Total: <strong>{totalHours.toFixed(1)}h</strong>
          </span>
          <span className="text-muted-foreground">
            Billable: <strong>{billableHours.toFixed(1)}h</strong>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No time entries yet. Use the timer or manual entry above.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Billable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {entry.project.name}
                        </p>
                        {entry.project.client && (
                          <p className="text-xs text-muted-foreground">
                            {entry.project.client.company_name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {entry.description || "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.hours.toFixed(1)}h
                    </TableCell>
                    <TableCell>
                      {entry.is_billable ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
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
  );
}
