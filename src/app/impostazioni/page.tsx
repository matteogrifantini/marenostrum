import type { Metadata } from "next";
import { SettingsExperience } from "../../components/settings-experience";
import { MobileNav } from "../../components/mobile-nav";
import { PageShell } from "../../components/page-shell";
import { createClient } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "Impostazioni e preferiti",
  description: "Gestisci accesso, preferenze, preferiti sincronizzati e supporto di Mare Nostrum.",
  alternates: { canonical: "https://marenostrum.app/impostazioni" },
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string | string[] }>;
}) {
  const query = await searchParams;
  const client = await createClient();
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  const authParam = Array.isArray(query.auth) ? query.auth[0] : query.auth;

  return (
    <PageShell activeNav="impostazioni">
      <SettingsExperience initialEmail={data.user?.email ?? null} authError={authParam === "error"} />
      <MobileNav active="impostazioni" />
    </PageShell>
  );
}
