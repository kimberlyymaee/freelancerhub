"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import type { Project } from "@/lib/types";

const entrySchema = z.object({
  project_id: z.string().min(1, "Select a project"),
  date: z.string().min(1, "Date is required"),
  hours: z.coerce.number().min(0.1, "Must be at least 0.1 hours"),
  description: z.string().optional(),
  is_billable: z.boolean().default(true),
});

type EntryFormData = z.infer<typeof entrySchema>;

interface ManualEntryProps {
  projects: (Pick<Project, "id" | "name"> & {
    client: { company_name: string } | null;
  })[];
  userId: string;
  onSave: () => void;
}

export function ManualEntry({ projects, userId, onSave }: ManualEntryProps) {
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(entrySchema) as any,
    defaultValues: {
      project_id: "",
      date: today,
      hours: "" as unknown as number,
      description: "",
      is_billable: true,
    },
  });

  const projectId = watch("project_id");
  const isBillable = watch("is_billable");

  async function onSubmit(data: EntryFormData) {
    const supabase = createClient();

    const { error } = await supabase.from("time_entries").insert({
      user_id: userId,
      project_id: data.project_id,
      date: data.date,
      hours: data.hours,
      description: data.description || null,
      is_billable: data.is_billable,
    });

    if (error) {
      toast.error("Failed to save entry: " + error.message);
      return;
    }

    toast.success(`${data.hours}h logged successfully`);
    reset({ project_id: "", date: today, hours: "" as unknown as number, description: "", is_billable: true });
    onSave();
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Manual Entry</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 flex flex-col flex-1">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select
              value={projectId}
              onValueChange={(val) => setValue("project_id", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    {p.client && ` (${p.client.company_name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.project_id && (
              <p className="text-xs text-destructive">
                {errors.project_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0.1"
                placeholder="0.0"
                {...register("hours")}
              />
              {errors.hours && (
                <p className="text-xs text-destructive">
                  {errors.hours.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="What did you work on?"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_billable"
              checked={isBillable}
              onChange={(e) => setValue("is_billable", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_billable" className="text-sm font-normal">
              Billable
            </Label>
          </div>

          <Button type="submit" size="sm" disabled={isSubmitting} className="w-full mt-auto">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Log Time
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
