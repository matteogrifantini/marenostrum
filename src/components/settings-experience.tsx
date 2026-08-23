"use client";

import Link from "next/link";
import { Bell, Check, Heart, LogOut, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { FAVORITES_STORAGE_KEY } from "./favorite-toggle";

type SettingsExperienceProps = {
  initialEmail: string | null;
  authError?: boolean;
};

type SyncState = "idle" | "loading" | "done" | "error";

function notificationPreference() {
  return typeof window !== "undefined" && window.localStorage.getItem("marenostrum:notifications:v1") === "enabled";
}

function subscribeToNotificationPreference(onChange: () => void) {
  window.addEventListener("marenostrum:notifications:changed", onChange);
  return () => window.removeEventListener("marenostrum:notifications:changed", onChange);
}

function readLocalFavorites() {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) && parsed.every((value): value is string => typeof value === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function SettingsExperience({ initialEmail, authError = false }: SettingsExperienceProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [message, setMessage] = useState<string | null>(authError ? "Il link di accesso non è più valido. Richiedine uno nuovo." : null);
  const notificationsEnabled = useSyncExternalStore(
    subscribeToNotificationPreference,
    notificationPreference,
    () => false,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialEmail) return;

    fetch("/api/favorites")
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { favorites?: unknown };
      })
      .then((body) => {
        if (body && Array.isArray(body.favorites)) setFavoriteCount(body.favorites.length);
      })
      .catch(() => undefined);
  }, [initialEmail]);

  async function requestMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const client = createClient();
    if (!client || !email.trim()) {
      setMessage("Inserisci un indirizzo email valido.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/impostazioni`,
      },
    });

    setMessage(error ? "Non siamo riusciti a inviare il link. Riprova tra poco." : "Controlla la tua email: il link di accesso è pronto.");
    setIsSubmitting(false);
  }

  async function syncFavorites() {
    setSyncState("loading");
    const localFavorites = readLocalFavorites();

    try {
      await Promise.all(
        localFavorites.map((slug) =>
          fetch("/api/favorites", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ slug }),
          }).then((response) => {
            if (!response.ok && response.status !== 409) throw new Error("sync failed");
          }),
        ),
      );
      const response = await fetch("/api/favorites");
      const body = (await response.json()) as { favorites?: unknown };
      setFavoriteCount(Array.isArray(body.favorites) ? body.favorites.length : localFavorites.length);
      setSyncState("done");
    } catch {
      setSyncState("error");
    }
  }

  async function signOut() {
    const client = createClient();
    await client?.auth.signOut();
    router.refresh();
  }

  async function toggleNotifications() {
    if (!notificationsEnabled) {
      if (typeof Notification === "undefined") {
        setMessage("Il browser non supporta le notifiche.");
        return;
      }
      const permission = Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Autorizzazione alle notifiche non concessa.");
        return;
      }
    }

    const nextEnabled = !notificationsEnabled;
    window.localStorage.setItem("marenostrum:notifications:v1", nextEnabled ? "enabled" : "disabled");
    window.dispatchEvent(new Event("marenostrum:notifications:changed"));
    setMessage(nextEnabled ? "Avvisi locali attivati su questo dispositivo." : "Avvisi locali disattivati.");
  }

  return (
    <main className="min-h-screen pb-24 lg:pb-10">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
        <header>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sea-deep)]">Il tuo Mare Nostrum</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.06em]">Impostazioni</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">Gestisci preferiti, accesso e avvisi senza cambiare il modo in cui scegli la spiaggia.</p>
        </header>

        {message ? <p role="status" className="mt-5 rounded-[1rem] bg-[var(--sun-soft)] px-4 py-3 text-sm font-semibold text-[var(--ink)]">{message}</p> : null}

        <section className="detail-surface mt-6 p-5 sm:p-6" aria-labelledby="account-title">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[0.8rem] bg-[var(--sea-soft)] text-[var(--sea-deep)]"><ShieldCheck aria-hidden="true" size={19} /></span>
            <div>
              <h2 id="account-title" className="text-lg font-extrabold">Account e sincronizzazione</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">L’accesso serve solo a ritrovare i tuoi preferiti su più dispositivi. Non usiamo queste informazioni per pubblicità o profilazione.</p>
            </div>
          </div>

          {initialEmail ? (
            <div className="mt-5 flex flex-col gap-3 rounded-[1rem] bg-[var(--surface-muted)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">Connesso come</p>
                <p className="mt-1 text-sm font-bold text-[var(--ink)]">{initialEmail}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{favoriteCount} preferiti sincronizzati</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={syncFavorites} disabled={syncState === "loading"} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--ink)] px-4 text-xs font-extrabold text-white disabled:opacity-60">
                  <Heart aria-hidden="true" size={15} /> {syncState === "loading" ? "Sincronizzo…" : "Sincronizza"}
                </button>
                <button type="button" onClick={signOut} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--surface)] px-4 text-xs font-extrabold text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line)]">
                  <LogOut aria-hidden="true" size={15} /> Esci
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={requestMagicLink} className="mt-5 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="account-email" className="sr-only">La tua email</label>
              <div className="relative min-w-0 flex-1">
                <Mail aria-hidden="true" size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input id="account-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="La tua email" className="min-h-12 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] pl-11 pr-4 text-sm font-semibold outline-none focus:border-[var(--sun)]" />
              </div>
              <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 text-sm font-extrabold text-white disabled:opacity-60">
                <Mail aria-hidden="true" size={16} /> {isSubmitting ? "Invio…" : "Ricevi il link"}
              </button>
            </form>
          )}
        </section>

        <section className="detail-surface mt-4 p-5 sm:p-6" aria-labelledby="local-title">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[0.8rem] bg-[var(--sun-soft)] text-[var(--sun-dark)]"><Bell aria-hidden="true" size={19} /></span>
            <div className="min-w-0 flex-1">
              <h2 id="local-title" className="text-lg font-extrabold">Avvisi su questo dispositivo</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Preparano il dispositivo a ricevere gli avvisi sulle condizioni salvate. L’invio automatico degli alert meteo resta legato all’attivazione del servizio notifiche.</p>
            </div>
            <button type="button" aria-pressed={notificationsEnabled} onClick={toggleNotifications} className={`relative inline-flex h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${notificationsEnabled ? "bg-[var(--sea)]" : "bg-[var(--line)]"}`}>
              <span className={`size-5 rounded-full bg-white shadow-sm transition-transform ${notificationsEnabled ? "translate-x-5" : "translate-x-0"}`} />
              <span className="sr-only">{notificationsEnabled ? "Disattiva avvisi" : "Attiva avvisi"}</span>
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-[var(--ink-soft)]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-3 py-2"><Check aria-hidden="true" size={14} /> Nessuna profilazione</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-3 py-2"><Check aria-hidden="true" size={14} /> Dati cancellabili</span>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-[var(--sea-deep)]">
          <Link href="/preferiti" className="underline underline-offset-4">Apri i preferiti</Link>
          <Link href="/privacy" className="underline underline-offset-4">Privacy</Link>
          <Link href="/cookie" className="underline underline-offset-4">Cookie</Link>
        </div>
      </div>
    </main>
  );
}
