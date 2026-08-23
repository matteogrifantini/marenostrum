import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsExperience } from "../../components/settings-experience";

const fetchMock = vi.hoisted(() => vi.fn(async () => ({
  ok: true,
  status: 200,
  json: async () => ({ favorites: [] }),
})));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SettingsExperience", () => {
  it("explains local favorites and offers quick account access", () => {
    render(<SettingsExperience initialEmail={null} />);

    expect(screen.getByRole("heading", { name: "Impostazioni" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continua con Google" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continua con Apple" })).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accedi" })).toBeInTheDocument();
    expect(screen.getByText(/ritrovare i tuoi preferiti su più dispositivi/)).toBeInTheDocument();
  });

  it("shows the signed-in account with automatic favorites sync", async () => {
    vi.stubGlobal("fetch", fetchMock);
    render(<SettingsExperience initialEmail="matteo@example.com" />);

    expect(screen.getByText("matteo@example.com")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("0 preferiti salvati sul tuo account")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Sincronizza/ })).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Esci/ })).toBeInTheDocument();
  });
});
