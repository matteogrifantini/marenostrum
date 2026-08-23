import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsExperience } from "../../components/settings-experience";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("SettingsExperience", () => {
  it("explains local favorites and offers quick account access", () => {
    render(<SettingsExperience initialEmail={null} />);

    expect(screen.getByRole("heading", { name: "Impostazioni" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continua con Google" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continua con Apple" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accedi" })).toBeInTheDocument();
    expect(screen.getByText(/ritrovare i tuoi preferiti su più dispositivi/)).toBeInTheDocument();
  });

  it("shows the signed-in account and sync action", () => {
    render(<SettingsExperience initialEmail="matteo@example.com" />);

    expect(screen.getByText("matteo@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sincronizza/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Esci/ })).toBeInTheDocument();
  });
});
