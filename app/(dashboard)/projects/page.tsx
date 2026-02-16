import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { ProjectTable } from "@/components/projects/project-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
  const session = await auth();
  const supabase = createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, client:clients(id, company_name)")
    .order("created_at", { ascending: false });

  const { data: clients } = await supabase
    .from("clients")
    .select("id, company_name")
    .eq("status", "active")
    .order("company_name");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, default_hourly_rate")
    .eq("id", session!.user.id)
    .single();

  return (
    <>
      <Header title="Projects" userName={profile?.full_name} userEmail={session?.user?.email}>
        <Link href="/projects?new=true">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </Header>
      <div className="p-4 md:p-6">
        <ProjectTable
          projects={projects ?? []}
          clients={clients ?? []}
          userId={session!.user.id}
          defaultRate={profile?.default_hourly_rate}
        />
      </div>
    </>
  );
}
