import { createClient } from "../../../lib/supabase/server";

type AuthenticatedUser = {
  id: string;
  email?: string;
};

export type FavoritesApiDependencies = {
  getUser: () => Promise<AuthenticatedUser | null>;
  list: (userId: string) => Promise<string[]>;
  add: (userId: string, slug: string) => Promise<string>;
  remove: (userId: string, slug: string) => Promise<void>;
};

const FAVORITES_ERROR = "Accedi per sincronizzare i preferiti";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isMissingAuthSessionError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const candidate = error as { name?: unknown; message?: unknown };
  return candidate.name === "AuthSessionMissingError" || (
    typeof candidate.message === "string" &&
    candidate.message.toLowerCase().includes("auth session missing")
  );
}

function errorResponse(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

function parseSlug(value: unknown) {
  if (typeof value !== "string") return null;
  const slug = value.trim();
  return slug && slug.length <= 120 && SLUG_PATTERN.test(slug) ? slug : null;
}

async function parseRequestSlug(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return null;
    return parseSlug((body as Record<string, unknown>).slug);
  } catch {
    return null;
  }
}

async function createDefaultDependencies(): Promise<FavoritesApiDependencies> {
  const client = await createClient();

  if (!client) {
    throw new Error("Supabase public configuration is missing");
  }

  return {
    async getUser() {
      const { data, error } = await client.auth.getUser();
      if (error) {
        if (isMissingAuthSessionError(error)) return null;
        throw error;
      }
      return data.user
        ? { id: data.user.id, email: data.user.email ?? undefined }
        : null;
    },
    async list(userId) {
      const { data, error } = await client
        .from("user_favorites")
        .select("beach_slug")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? [])
        .map((row) => row.beach_slug)
        .filter((slug): slug is string => typeof slug === "string");
    },
    async add(userId, slug) {
      const { error } = await client
        .from("user_favorites")
        .upsert(
          { user_id: userId, beach_slug: slug },
          { onConflict: "user_id,beach_slug", ignoreDuplicates: true },
        );
      if (error) throw error;
      return slug;
    },
    async remove(userId, slug) {
      const { error } = await client
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("beach_slug", slug);
      if (error) throw error;
    },
  };
}

export async function handleFavorites(
  request: Request,
  providedDependencies?: FavoritesApiDependencies,
) {
  let dependencies: FavoritesApiDependencies;

  try {
    dependencies = providedDependencies ?? (await createDefaultDependencies());
  } catch {
    return errorResponse(503, "Sincronizzazione non disponibile");
  }

  let user: AuthenticatedUser | null;

  try {
    user = await dependencies.getUser();
  } catch {
    return errorResponse(503, "Sincronizzazione non disponibile");
  }

  if (!user) return errorResponse(401, FAVORITES_ERROR);

  try {
    if (request.method === "GET") {
      return Response.json({ ok: true, favorites: await dependencies.list(user.id) });
    }

    if (request.method === "POST" || request.method === "DELETE") {
      const slug = await parseRequestSlug(request);
      if (!slug) return errorResponse(400, "Spiaggia non valida");

      if (request.method === "POST") {
        return Response.json(
          { ok: true, favorite: await dependencies.add(user.id, slug) },
          { status: 201 },
        );
      }

      await dependencies.remove(user.id, slug);
      return Response.json({ ok: true, favorite: slug });
    }

    return new Response(null, {
      status: 405,
      headers: { allow: "GET, POST, DELETE" },
    });
  } catch {
    return errorResponse(503, "Sincronizzazione non disponibile");
  }
}

export async function GET(request: Request) {
  return handleFavorites(request);
}

export async function POST(request: Request) {
  return handleFavorites(request);
}

export async function DELETE(request: Request) {
  return handleFavorites(request);
}
