"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CLIENT_STATUSES } from "@/lib/constants";
import type { Client } from "@/lib/types";

const clientSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  contact_name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "on_hold", "completed", "prospect"]),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  userId: string;
  client?: Client;
  variant?: "page" | "modal";
  onSuccess?: () => void;
}

export function ClientForm({ userId, client, variant = "page", onSuccess }: ClientFormProps) {
  const router = useRouter();
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      company_name: client?.company_name ?? "",
      contact_name: client?.contact_name ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      address: client?.address ?? "",
      status: client?.status ?? "active",
      tags: client?.tags?.join(", ") ?? "",
      notes: client?.notes ?? "",
    },
  });

  const status = watch("status");

  async function onSubmit(data: ClientFormData) {
    const supabase = createClient();

    const payload = {
      user_id: userId,
      company_name: data.company_name,
      contact_name: data.contact_name || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      status: data.status,
      tags: data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      notes: data.notes || null,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", client.id);

      if (error) {
        toast.error("Failed to update client: " + error.message);
        return;
      }
      toast.success("Client updated");
      if (variant === "modal" && onSuccess) {
        onSuccess();
      } else {
        router.push(`/clients/${client.id}`);
      }
    } else {
      const { data: newClient, error } = await supabase
        .from("clients")
        .insert(payload)
        .select()
        .single();

      if (error) {
        toast.error("Failed to create client: " + error.message);
        return;
      }
      toast.success("Client created");
      if (variant === "modal" && onSuccess) {
        onSuccess();
      } else {
        router.push(`/clients/${newClient.id}`);
      }
    }

    router.refresh();
  }

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company_name">
            Company Name <span className="text-destructive">*</span>
          </Label>
          <Input id="company_name" {...register("company_name")} />
          {errors.company_name && (
            <p className="text-xs text-destructive">
              {errors.company_name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_name">Contact Name</Label>
          <Input id="contact_name" {...register("contact_name")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" rows={2} {...register("address")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(val) => setValue("status", val as ClientFormData["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            {...register("tags")}
            placeholder="web, react, ongoing"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...register("notes")} />
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={variant === "modal" && onSuccess ? onSuccess : () => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isEditing ? "Update Client" : "Create Client"}
        </Button>
      </div>
    </form>
  );

  if (variant === "modal") {
    return formContent;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {formContent}
      </CardContent>
    </Card>
  );
}
