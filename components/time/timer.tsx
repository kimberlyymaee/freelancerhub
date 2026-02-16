"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Play, Square, Loader2 } from "lucide-react";
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

  function formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-4xl font-mono font-bold tabular-nums">
            {formatElapsed(elapsed)}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Project</Label>
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
          <div className="space-y-2">
            <Label htmlFor="timer-desc">Description</Label>
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
            className="w-full"
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
          <Button onClick={startTimer} className="w-full">
            <Play className="mr-2 h-4 w-4" />
            Start Timer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
