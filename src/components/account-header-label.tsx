"use client";

import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

type DisplayUser = Pick<User, "email" | "user_metadata">;

export function getUserDisplayName(user: DisplayUser | null | undefined) {
  const metadata = user?.user_metadata;
  const metadataName = [
    metadata?.full_name,
    metadata?.name,
    metadata?.user_name,
    metadata?.preferred_username,
  ].find((value): value is string => typeof value === "string" && value.trim().length > 0);

  return metadataName?.trim() || user?.email?.trim() || "Accedi";
}

export function AccountHeaderLabel() {
  const [label, setLabel] = useState("Accedi");

  useEffect(() => {
    const client = createClient();
    if (!client) return;

    let mounted = true;
    void client.auth.getUser()
      .then(({ data }: { data: { user: User | null } }) => {
        if (mounted) setLabel(getUserDisplayName(data.user));
      })
      .catch(() => undefined);

    const { data: { subscription } } = client.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (mounted) setLabel(getUserDisplayName(session?.user));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <span className="hidden max-w-[10rem] truncate lg:inline" title={label}>
      {label}
    </span>
  );
}
