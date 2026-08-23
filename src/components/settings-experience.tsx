"use client";

import Link from "next/link";
import {
  Apple,
  ArrowRight,
  Bell,
  Check,
  Globe2,
  Languages,
  LogOut,
  Mail,
  MessageSquarePlus,
  Music2,
  Ruler,
  ShieldCheck,
  ThermometerSun,
  Trash2,
  Waves,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { buildAuthRedirectUrl } from "../lib/auth-redirect";
import {
  writeUserPreferences,
  type UserPreferences,
  useUserPreferences,
} from "../lib/user-preferences";
import { createClient } from "../lib/supabase/client";
import { FAVORITES_STORAGE_KEY } from "./favorite-toggle";

type SettingsExperienceProps = {
  initialEmail: string | null;
  authError?: boolean;
};

type SyncState = "idle" | "loading" | "done" | "error";
type DeleteState = "idle" | "confirming" | "loading";
type AuthMode = "sign-in" | "sign-up";
type AuthProvider = "google" | "apple";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || null;
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || null;
const TIKTOK_URL = process.env.NEXT_PUBLIC_TIKTOK_URL?.trim() || null;

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
  const preferences = useUserPreferences();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [deleteState, setDeleteState] = useState<DeleteState>("idle");
  const [message, setMessage] = useState<string | null>(authError ? "Accesso non completato. Riprova." : null);
  const notificationsEnabled = useSyncExternalStore(
    subscribeToNotificationPreference,
    notificationPreference,
    () => false,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialEmail) return;

    let active = true;

    async function synchronizeFavorites() {
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
        if (!response.ok) throw new Error("sync failed");
        const body = (await response.json()) as { favorites?: unknown };

        if (active) {
          setFavoriteCount(Array.isArray(body.favorites) ? body.favorites.length : localFavorites.length);
          setSyncState("done");
        }
      } catch {
        if (active) setSyncState("error");
      }
    }

    void synchronizeFavorites();

    return () => {
      active = false;
    };
  }, [initialEmail]);

  function authRedirectUrl() {
    return buildAuthRedirectUrl(window.location.origin, "/impostazioni");
  }

  function updatePreferences(patch: Partial<UserPreferences>) {
    writeUserPreferences({ ...preferences, ...patch });
    setMessage("Preferenza salvata su questo dispositivo.");
  }

  async function continueWithProvider(provider: AuthProvider) {
    setIsSubmitting(true);
    setMessage(null);

    const client = createClient();
    if (!client) {
      setMessage("Accesso momentaneamente non disponibile.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: authRedirectUrl() },
    });

    if (error) {
      setMessage(provider === "apple" ? "Accesso con Apple non disponibile." : "Accesso con Google non disponibile.");
      setIsSubmitting(false);
    }
  }

  async function submitPasswordAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const client = createClient();
    if (!client || !email.trim() || !password) {
      setMessage("Inserisci email e password.");
      setIsSubmitting(false);
      return;
    }

    if (authMode === "sign-up") {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: authRedirectUrl() },
      });

      if (error) {
        setMessage("Non siamo riusciti a creare l’account. Riprova.");
      } else if (data.session) {
        router.refresh();
      } else {
        setMessage("Controlla l’email per confermare l’account.");
      }
    } else {
      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage("Email o password non corretti.");
      } else {
        router.refresh();
      }
    }

    setIsSubmitting(false);
  }

  async function signOut() {
    const client = createClient();
    await client?.auth.signOut();
    router.refresh();
  }

  async function deleteAccount() {
    if (deleteState !== "confirming") return;

    setDeleteState("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/account/delete", { method: "POST" });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error ?? "account deletion failed");

      window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
      await createClient()?.auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setDeleteState("idle");
      setMessage("Non siamo riusciti a eliminare l’account. Riprova.");
    }
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
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">Gestisci accesso, preferenze e avvisi senza cambiare il modo in cui scegli la spiaggia.</p>
        </header>

        {message ? <p role="status" className="mt-5 rounded-[1rem] bg-[var(--sun-soft)] px-4 py-3 text-sm font-semibold text-[var(--ink)]">{message}</p> : null}

        <section className="detail-surface mt-6 p-5 sm:p-6" aria-labelledby="account-title">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[0.8rem] bg-[var(--sea-soft)] text-[var(--sea-deep)]"><ShieldCheck aria-hidden="true" size={19} /></span>
            <div>
              <h2 id="account-title" className="text-lg font-extrabold">Account e preferiti</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">L’accesso serve solo a ritrovare i tuoi preferiti su più dispositivi. Non usiamo queste informazioni per pubblicità o profilazione.</p>
            </div>
          </div>

          {initialEmail ? (
            <>
              <div className="mt-5 flex flex-col gap-3 rounded-[1rem] bg-[var(--surface-muted)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">Connesso come</p>
                  <p className="mt-1 text-sm font-bold text-[var(--ink)]">{initialEmail}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {syncState === "loading"
                      ? "Aggiorno automaticamente i preferiti…"
                      : syncState === "error"
                        ? "Aggiornamento automatico non riuscito. Riproverò al prossimo accesso."
                        : `${favoriteCount} ${favoriteCount === 1 ? "preferito salvato" : "preferiti salvati"} sul tuo account`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={signOut} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--surface)] px-4 text-xs font-extrabold text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line)]">
                    <LogOut aria-hidden="true" size={15} /> Esci
                  </button>
                </div>
              </div>

              <div className="mt-5 border-t border-[var(--line)] pt-5">
                <p className="text-sm font-extrabold text-[var(--ink)]">Elimina il tuo account</p>
                <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--muted)]">Rimuove l’account e i preferiti sincronizzati. Questa azione non può essere annullata.</p>
                {deleteState === "confirming" ? (
                  <div className="mt-3 rounded-[1rem] border border-[rgba(206,98,86,0.3)] bg-[var(--score-poor-soft)] p-4">
                    <p className="text-sm font-bold text-[var(--ink)]">Confermi l’eliminazione definitiva?</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={deleteAccount} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--score-poor)] px-4 text-xs font-extrabold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]">
                        <Trash2 aria-hidden="true" size={14} /> Sì, elimina account
                      </button>
                      <button type="button" onClick={() => setDeleteState("idle")} className="min-h-10 rounded-full bg-[var(--surface)] px-4 text-xs font-extrabold text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line)]">
                        Annulla
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setDeleteState("confirming")} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-[rgba(206,98,86,0.4)] px-4 text-xs font-extrabold text-[var(--score-poor)] hover:bg-[var(--score-poor-soft)]">
                    <Trash2 aria-hidden="true" size={14} /> Elimina il mio account
                  </button>
                )}
                {deleteState === "loading" ? <p role="status" className="mt-3 text-xs font-bold text-[var(--muted)]">Elimino i tuoi dati…</p> : null}
              </div>
            </>
          ) : (
            <div className="mt-5">
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => continueWithProvider("google")}
                  disabled={isSubmitting}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-4 text-sm font-extrabold text-white transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--sea-deep)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
                >
                  <Globe2 aria-hidden="true" size={17} /> Continua con Google
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[var(--disabled-surface)] px-4 text-sm font-extrabold text-[var(--disabled-ink)] shadow-[inset_0_0_0_1px_var(--disabled-line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
                >
                  <Apple aria-hidden="true" size={17} /> Continua con Apple
                </button>
              </div>

              <div className="my-4 flex items-center gap-3 text-xs font-bold text-[var(--muted)]">
                <span className="h-px flex-1 bg-[var(--line)]" />
                <span>oppure email</span>
                <span className="h-px flex-1 bg-[var(--line)]" />
              </div>

              <form onSubmit={submitPasswordAuth} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                <div className="relative min-w-0">
                  <label htmlFor="account-email" className="sr-only">Email</label>
                  <Mail aria-hidden="true" size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="min-h-12 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] pl-11 pr-4 text-sm font-semibold outline-none focus:border-[var(--sun)]" />
                </div>
                <div className="relative min-w-0">
                  <label htmlFor="account-password" className="sr-only">Password</label>
                  <input id="account-password" type="password" autoComplete={authMode === "sign-in" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="min-h-12 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--sun)]" />
                </div>
                <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 text-sm font-extrabold text-white transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--sea-deep)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]">
                  {isSubmitting ? "Attendo…" : authMode === "sign-in" ? "Accedi" : "Crea account"} <ArrowRight aria-hidden="true" size={16} />
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setAuthMode((current) => current === "sign-in" ? "sign-up" : "sign-in");
                  setMessage(null);
                }}
                className="mt-3 min-h-10 text-xs font-bold text-[var(--sea-deep)] underline decoration-[var(--line)] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
              >
                {authMode === "sign-in" ? "Crea account" : "Ho già un account"}
              </button>
            </div>
          )}
        </section>

        <section className="detail-surface mt-4 p-5 sm:p-6" aria-labelledby="preferences-title">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[0.8rem] bg-[var(--sun-soft)] text-[var(--sun-dark)]"><Languages aria-hidden="true" size={19} /></span>
            <div>
              <h2 id="preferences-title" className="text-lg font-extrabold">Preferenze</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Scegli come leggere distanze e condizioni. Le preferenze restano su questo dispositivo.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PreferenceSelect id="preference-language" label="Lingua" icon={<Languages aria-hidden="true" size={16} />} value={preferences.language} onChange={(value) => updatePreferences({ language: value as UserPreferences["language"] })}>
              <option value="it">Italiano</option>
            </PreferenceSelect>
            <PreferenceSelect id="preference-distance" label="Distanze" icon={<Ruler aria-hidden="true" size={16} />} value={preferences.distanceUnit} onChange={(value) => updatePreferences({ distanceUnit: value as UserPreferences["distanceUnit"] })}>
              <option value="km">Chilometri (km)</option>
              <option value="mi">Miglia (mi)</option>
            </PreferenceSelect>
            <PreferenceSelect id="preference-temperature" label="Temperatura" icon={<ThermometerSun aria-hidden="true" size={16} />} value={preferences.temperatureUnit} onChange={(value) => updatePreferences({ temperatureUnit: value as UserPreferences["temperatureUnit"] })}>
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
            </PreferenceSelect>
            <PreferenceSelect id="preference-waves" label="Altezza onde" icon={<Waves aria-hidden="true" size={16} />} value={preferences.waveHeightUnit} onChange={(value) => updatePreferences({ waveHeightUnit: value as UserPreferences["waveHeightUnit"] })}>
              <option value="meters">Metri (m)</option>
              <option value="feet">Piedi (ft)</option>
            </PreferenceSelect>
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Per ora Mare Nostrum è disponibile in italiano. Le altre lingue arriveranno prossimamente.</p>
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

        <section className="detail-surface mt-4 p-5 sm:p-6" aria-labelledby="information-title">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[0.8rem] bg-[var(--sea-soft)] text-[var(--sea-deep)]"><MessageSquarePlus aria-hidden="true" size={19} /></span>
            <div>
              <h2 id="information-title" className="text-lg font-extrabold">Informazioni e supporto</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Tutto quello che serve per conoscere il progetto e gestire le tue scelte.</p>
            </div>
          </div>
          <nav aria-label="Informazioni su Mare Nostrum" className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-bold text-[var(--sea-deep)] sm:grid-cols-3">
            <Link href="/" className="underline decoration-[var(--line)] underline-offset-4">Mare Nostrum</Link>
            <Link href="/privacy" className="underline decoration-[var(--line)] underline-offset-4">Privacy</Link>
            <Link href="/cookie" className="underline decoration-[var(--line)] underline-offset-4">Cookie policy</Link>
            <Link href="/cookie#preferenze" className="underline decoration-[var(--line)] underline-offset-4">Preferenze cookie</Link>
            <Link href="/termini" className="underline decoration-[var(--line)] underline-offset-4">Termini</Link>
          </nav>

          <div className="mt-5 border-t border-[var(--line)] pt-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">Supporto</p>
            {SUPPORT_EMAIL ? (
              <a href={`mailto:${SUPPORT_EMAIL}?subject=Supporto%20Mare%20Nostrum`} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--ink)] px-4 text-xs font-extrabold text-white">
                <MessageSquarePlus aria-hidden="true" size={15} /> Apri un ticket
              </a>
            ) : (
              <button type="button" disabled aria-disabled="true" className="mt-2 inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-full bg-[var(--surface-muted)] px-4 text-xs font-extrabold text-[var(--muted)]">
                <MessageSquarePlus aria-hidden="true" size={15} /> Apri un ticket · prossimamente
              </button>
            )}
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-[var(--line)] pt-5" aria-label="Social Mare Nostrum">
            <span className="mr-1 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">Seguici</span>
            <SocialLink label="Instagram" href={INSTAGRAM_URL}><InstagramGlyph /></SocialLink>
            <SocialLink label="TikTok" href={TIKTOK_URL}><Music2 aria-hidden="true" size={16} /></SocialLink>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-[var(--sea-deep)]">
          <Link href="/preferiti" className="underline underline-offset-4">Apri i preferiti</Link>
        </div>
      </div>
    </main>
  );
}

function PreferenceSelect({
  id,
  label,
  icon,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="rounded-[1rem] bg-[var(--surface-muted)] p-3">
      <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">
        <span className="text-[var(--sea-deep)]">{icon}</span>{label}
      </span>
      <span className="relative mt-2 block">
        <select id={id} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full appearance-none rounded-full bg-[var(--surface)] px-4 pr-9 text-sm font-bold text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--sun)]">
          {children}
        </select>
        <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">⌄</span>
      </span>
    </label>
  );
}

function SocialLink({ label, href, children }: { label: string; href: string | null; children: ReactNode }) {
  const className = "grid size-9 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--ink-soft)] transition-colors hover:bg-[var(--sun-soft)] hover:text-[var(--ink)]";

  if (!href) {
    return <span aria-label={`${label}, prossimamente`} title={`${label} — prossimamente`} className={`${className} opacity-60`}>{children}</span>;
  }

  return <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={className}>{children}</a>;
}

function InstagramGlyph() {
  return (
    <svg
      aria-hidden="true"
      data-social-icon="instagram"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.35" cy="6.65" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
