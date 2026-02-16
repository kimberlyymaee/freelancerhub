"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Profile } from "@/lib/types";
import { CURRENCIES } from "@/lib/constants";

const profileSchema = z.object({
  business_name: z.string().optional(),
  full_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_id_tin: z.string().optional(),
  default_currency: z.string().default("PHP"),
  default_hourly_rate: z.coerce.number().min(0).optional().or(z.literal("")),
  tax_regime: z.enum(["eight_percent", "graduated"]).default("eight_percent"),
  default_payment_terms: z.string().optional(),
  default_invoice_notes: z.string().optional(),
  invoice_prefix: z.string().default("INV"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: Profile | null;
  userId: string;
}

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      business_name: profile?.business_name ?? "",
      full_name: profile?.full_name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
      tax_id_tin: profile?.tax_id_tin ?? "",
      default_currency: profile?.default_currency ?? "PHP",
      default_hourly_rate: profile?.default_hourly_rate ?? "",
      tax_regime: profile?.tax_regime ?? "eight_percent",
      default_payment_terms: profile?.default_payment_terms ?? "Due within 30 days",
      default_invoice_notes: profile?.default_invoice_notes ?? "",
      invoice_prefix: profile?.invoice_prefix ?? "INV",
    },
  });

  const taxRegime = watch("tax_regime");
  const currency = watch("default_currency");

  async function onSubmit(data: ProfileFormData) {
    const supabase = createClient();

    const updateData = {
      ...data,
      default_hourly_rate: data.default_hourly_rate === "" ? null : Number(data.default_hourly_rate),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      toast.error("Failed to save settings: " + error.message);
    } else {
      toast.success("Settings saved successfully");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Business Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input id="business_name" {...register("business_name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register("full_name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" rows={2} {...register("address")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id_tin">TIN (Tax ID Number)</Label>
            <Input id="tax_id_tin" {...register("tax_id_tin")} placeholder="000-000-000-000" />
          </div>
        </CardContent>
      </Card>

      {/* Rates & Currency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Rates</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="default_hourly_rate">Default Hourly Rate</Label>
            <Input
              id="default_hourly_rate"
              type="number"
              step="0.01"
              min="0"
              {...register("default_hourly_rate")}
            />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={currency}
              onValueChange={(val) => setValue("default_currency", val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tax Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tax Regime</Label>
            <Select
              value={taxRegime}
              onValueChange={(val) =>
                setValue("tax_regime", val as "eight_percent" | "graduated")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eight_percent">8% Flat Rate</SelectItem>
                <SelectItem value="graduated">Graduated Rates</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {taxRegime === "eight_percent"
                ? "8% on gross sales minus 250K exemption. No expense deductions."
                : "Graduated brackets on net income (revenue - expenses) + 3% percentage tax."}
            </p>
          </div>
          <div className="space-y-2">
            <Label>VAT Threshold</Label>
            <Input value="3,000,000 PHP" disabled />
            <p className="text-xs text-muted-foreground">
              You&apos;ll be warned when approaching this limit.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
              <Input id="invoice_prefix" {...register("invoice_prefix")} placeholder="INV" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_payment_terms">Payment Terms</Label>
              <Input
                id="default_payment_terms"
                {...register("default_payment_terms")}
                placeholder="Due within 30 days"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_invoice_notes">Default Invoice Notes</Label>
            <Textarea
              id="default_invoice_notes"
              rows={3}
              {...register("default_invoice_notes")}
              placeholder="Thank you for your business!"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>
    </form>
  );
}
