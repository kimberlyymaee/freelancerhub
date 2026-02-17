import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { TimePage as TimePageClient } from "@/components/time/time-page";
import { ImportDialog } from "@/components/import/import-dialog";
import { timeEntryImportConfig } from "@/lib/import/configs/time-entries";

export default async function TimePage() {
  const session = await auth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", session!.user.id)
    .single();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, client:clients(company_name)")
    .in("status", ["not_started", "in_progress"])
    .order("name");

  const { data: timeEntries } = await supabase
    .from("time_entries")
    .select("*, project:projects(id, name, client:clients(company_name))")
    .order("date", { ascending: false })
    .limit(100);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeProjects = (projects ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeEntries = (timeEntries ?? []) as any[];

  return (
    <>
      <Header title="Time Tracking" userName={profile?.full_name} userEmail={session?.user?.email}>
        <ImportDialog
          config={timeEntryImportConfig}
          userId={session!.user.id}
          fkData={[
            {
              tableName: "projects",
              entries: safeProjects.map((p: { name: string; id: string }) => ({
                display: p.name,
                id: p.id,
              })),
            },
          ]}
        />
      </Header>
      <div className="p-4 md:p-6">
        <TimePageClient
          projects={safeProjects}
          timeEntries={safeEntries}
          userId={session!.user.id}
        />
      </div>
    </>
  );
}
