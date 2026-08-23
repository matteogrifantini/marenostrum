type AuthenticatedUser = { id: string };

export type AccountDeletionDependencies = {
  getUser: () => Promise<AuthenticatedUser | null>;
  signOut: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
};

function errorResponse(status: number, error: string) {
  return Response.json(
    { ok: false, error },
    {
      status,
      headers: { "cache-control": "no-store" },
    },
  );
}

function isMissingAuthSessionError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: unknown; message?: unknown };
  return candidate.name === "AuthSessionMissingError" || (
    typeof candidate.message === "string" &&
    candidate.message.toLowerCase().includes("auth session missing")
  );
}

async function createDefaultDependencies(): Promise<AccountDeletionDependencies> {
  const [{ createSupabaseAdminClient }, { createClient }] = await Promise.all([
    import("../../../../lib/supabase/admin"),
    import("../../../../lib/supabase/server"),
  ]);
  const client = await createClient();
  const admin = createSupabaseAdminClient();

  if (!client) throw new Error("Supabase public configuration is missing");

  return {
    async getUser() {
      const { data, error } = await client.auth.getUser();
      if (error) {
        if (isMissingAuthSessionError(error)) return null;
        throw error;
      }
      return data.user ? { id: data.user.id } : null;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error && !isMissingAuthSessionError(error)) throw error;
    },
    async deleteUser(userId) {
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
  };
}

export async function handleAccountDeletion(
  request: Request,
  providedDependencies?: AccountDeletionDependencies,
) {
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      headers: { allow: "POST" },
    });
  }

  let dependencies: AccountDeletionDependencies;
  try {
    dependencies = providedDependencies ?? (await createDefaultDependencies());
  } catch {
    return errorResponse(503, "Eliminazione account non disponibile");
  }

  let user: AuthenticatedUser | null;
  try {
    user = await dependencies.getUser();
  } catch {
    return errorResponse(503, "Eliminazione account non disponibile");
  }

  if (!user) return errorResponse(401, "Accedi per eliminare il tuo account");

  try {
    // Revoca prima la sessione attiva: la cancellazione dell'utente non invalida
    // automaticamente eventuali access token già emessi.
    await dependencies.signOut();
    await dependencies.deleteUser(user.id);
    return Response.json(
      { ok: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return errorResponse(503, "Non siamo riusciti a eliminare l’account");
  }
}

export async function POST(request: Request) {
  return handleAccountDeletion(request);
}
