"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Play, Square, Loader2, Clock } from "lucide-react";
import type { Project } from "@/lib/types";

const TIMER_KEY = "freelancehub_timer";

interface TimerState {
  startTime: number;
  projectId: string;
}

interface TimerProps {
  projects: (Pick<Project, "id" | "name"> & {
    client: { company_name: string } | null;
  })[];
  userId: string;
  onSave: () => void;
}

export function Timer({ projects, userId, onSave }: TimerProps) {
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Load timer state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TIMER_KEY);
    if (stored) {
      const state: TimerState = JSON.parse(stored);
      setStartTime(state.startTime);
      setProjectId(state.projectId);
      setRunning(true);
    }
  }, []);

  // Update elapsed time every second
  useEffect(() => {
    if (!running || !startTime) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [running, startTime]);

  function startTimer() {
    if (!projectId) {
      toast.error("Select a project first");
      return;
    }

    const now = Date.now();
    setStartTime(now);
    setRunning(true);
    setElapsed(0);

    localStorage.setItem(
      TIMER_KEY,
      JSON.stringify({ startTime: now, projectId })
    );
  }

  async function stopTimer() {
    if (!startTime) return;

    setSaving(true);
    const hours = elapsed / 3600;

    if (hours < 0.01) {
      toast.error("Timer too short to save");
      localStorage.removeItem(TIMER_KEY);
      setRunning(false);
      setStartTime(null);
      setElapsed(0);
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("time_entries").insert({
      user_id: userId,
      project_id: projectId,
      date: new Date().toISOString().split("T")[0],
      hours: Math.round(hours * 100) / 100,
      description: description || null,
      is_billable: true,
    });

    if (error) {
      toast.error("Failed to save entry: " + error.message);
    } else {
      toast.success(`${hours.toFixed(2)}h logged successfully`);
      onSave();
    }

    localStorage.removeItem(TIMER_KEY);
    setRunning(false);
    setStartTime(null);
    setElapsed(0);
    setDescription("");
    setSaving(false);
  }

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Timer display area */}
      <div
        className={`px-6 pt-6 pb-5 transition-colors duration-500 ${
          running
            ? "bg-emerald-50 dark:bg-emerald-950/30"
            : ""
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`rounded-full p-1.5 ${
                running
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">
              {running ? "Tracking time" : "Timer"}
            </span>
          </div>
          {running && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          {[
            { value: h.toString().padStart(2, "0"), label: "hrs" },
            { value: m.toString().padStart(2, "0"), label: "min" },
            { value: s.toString().padStart(2, "0"), label: "sec" },
          ].map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-3">
              {i > 0 && (
                <span className="text-2xl font-light text-muted-foreground">
                  :
                </span>
              )}
              <div className="text-center">
                <p
                  className={`text-5xl font-mono font-bold tabular-nums leading-none ${
                    running ? "text-emerald-700 dark:text-emerald-400" : ""
                  }`}
                >
                  {unit.value}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  {unit.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {running && selectedProject && (
          <p className="text-center text-xs text-muted-foreground mt-3">
            {selectedProject.name}
            {selectedProject.client &&
              ` — ${selectedProject.client.company_name}`}
          </p>
        )}
      </div>

      {/* Controls */}
      <CardContent className="pt-4 space-y-3 flex-1 flex flex-col">
        <div className="space-y-1.5">
          <Label className="text-xs">Project</Label>
          <Select
            value={projectId}
            onValueChange={setProjectId}
            disabled={running}
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
        </div>

        {running && (
          <div className="space-y-1.5">
            <Label htmlFor="timer-desc" className="text-xs">
              Description
            </Label>
            <Input
              id="timer-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
            />
          </div>
        )}

        {running ? (
          <Button
            onClick={stopTimer}
            variant="destructive"
            className="w-full mt-auto"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Square className="mr-2 h-4 w-4" />
            )}
            Stop & Save
          </Button>
        ) : (
          <Button onClick={startTimer} className="w-full mt-auto">
            <Play className="mr-2 h-4 w-4" />
            Start Timer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
