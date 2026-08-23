import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(async () => ({ error: null })),
  signInWithPassword: vi.fn(async () => ({ error: null })),
  signUp: vi.fn(async () => ({ data: { session: null }, error: null })),
  signOut: vi.fn(async () => ({ error: null })),
}));

const fetchMock = vi.hoisted(() => vi.fn(async () => ({
  ok: true,
  status: 200,
  json: async () => ({ favorites: ["cala-rossa"] }),
})));

vi.mock("../lib/supabase/client", () => ({
  createClient: () => ({ auth: authMocks }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { SettingsExperience } from "./settings-experience";

describe("SettingsExperience auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("offers compact Google, Apple and email/password access", () => {
    render(<SettingsExperience initialEmail={null} />);

    expect(screen.getByRole("button", { name: "Continua con Google" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continua con Apple" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accedi" })).toBeInTheDocument();
  });

  it("starts Google OAuth with the internal callback URL", async () => {
    render(<SettingsExperience initialEmail={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Continua con Google" }));

    await waitFor(() => expect(authMocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback?next=%2Fimpostazioni",
      },
    }));
  });

  it("logs in with email and password and switches to registration mode", async () => {
    render(<SettingsExperience initialEmail={null} />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "utente@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password-sicura" } });
    fireEvent.click(screen.getByRole("button", { name: "Accedi" }));

    await waitFor(() => expect(authMocks.signInWithPassword).toHaveBeenCalledWith({
      email: "utente@example.com",
      password: "password-sicura",
    }));

    fireEvent.click(screen.getByRole("button", { name: "Crea account" }));
    expect(screen.getByRole("button", { name: "Crea account" })).toBeInTheDocument();
  });

  it("shows local units, legal links and an honest support placeholder", () => {
    render(<SettingsExperience initialEmail={null} />);

    expect(screen.getByRole("combobox", { name: "Lingua" })).toHaveValue("it");
    expect(screen.getByRole("combobox", { name: "Distanze" })).toHaveValue("km");
    expect(screen.getByRole("combobox", { name: "Temperatura" })).toHaveValue("celsius");
    expect(screen.getByRole("combobox", { name: "Altezza onde" })).toHaveValue("meters");
    expect(screen.getByRole("button", { name: /Apri un ticket/ })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Preferenze cookie" })).toHaveAttribute("href", "/cookie#preferenze");
    expect(screen.getByLabelText("Social Mare Nostrum")).toBeInTheDocument();
    const instagram = screen.getByLabelText("Instagram, prossimamente");
    expect(instagram).toBeInTheDocument();
    expect(instagram.querySelector('[data-social-icon="instagram"]')).not.toBeNull();
    expect(screen.getByLabelText("TikTok, prossimamente")).toBeInTheDocument();
  });

  it("syncs local favorites automatically after login", async () => {
    window.localStorage.setItem("marenostrum:favorites:v1", JSON.stringify(["cala-rossa"]));

    render(<SettingsExperience initialEmail="matteo@example.com" />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/favorites",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ slug: "cala-rossa" }),
      }),
    ));
    await waitFor(() => expect(screen.getByText("1 preferito salvato sul tuo account")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /Sincronizza/ })).not.toBeInTheDocument();
  });

  it("persists a changed unit preference and offers a destructive account confirmation", () => {
    const { rerender } = render(<SettingsExperience initialEmail="matteo@example.com" />);

    fireEvent.change(screen.getByRole("combobox", { name: "Temperatura" }), {
      target: { value: "fahrenheit" },
    });
    expect(screen.getByRole("combobox", { name: "Temperatura" })).toHaveValue("fahrenheit");
    expect(JSON.parse(window.localStorage.getItem("marenostrum:preferences:v1") ?? "{}")).toMatchObject({
      temperatureUnit: "fahrenheit",
    });

    fireEvent.click(screen.getByRole("button", { name: /Elimina il mio account/ }));
    expect(screen.getByText("Confermi l’eliminazione definitiva?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sì, elimina account" })).toBeInTheDocument();

    rerender(<SettingsExperience initialEmail="matteo@example.com" />);
    expect(screen.getByRole("combobox", { name: "Temperatura" })).toHaveValue("fahrenheit");
  });
});
