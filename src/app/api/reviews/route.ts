import { createClient } from "../../../lib/supabase/server";
import type { InternalReviewRow } from "../../../data/beach-content-repository";

type AuthenticatedUser = {
  id: string;
  email?: string;
  displayName?: string;
};

type ReviewWriteInput = {
  rating: number;
  body: string;
};

export type BeachReviewsApiDependencies = {
  getUser: () => Promise<AuthenticatedUser | null>;
  findPublishedBeach: (slug: string) => Promise<{ id: string } | null>;
  upsert: (
    userId: string,
    beachId: string,
    input: ReviewWriteInput,
    authorName: string,
  ) => Promise<InternalReviewRow>;
  remove: (userId: string, reviewId: string) => Promise<void>;
};

const AUTH_ERROR = "Accedi per lasciare una recensione";
const UNAVAILABLE_ERROR = "Recensioni non disponibili in questo momento";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID_PATTERN = /^[a-zA-Z0-9_-]{1,120}$/;

function errorResponse(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

function parseSlug(value: unknown) {
  if (typeof value !== "string") return null;
  const slug = value.trim();
  return slug && slug.length <= 120 && SLUG_PATTERN.test(slug) ? slug : null;
}

function parseReviewId(value: unknown) {
  if (typeof value !== "string") return null;
  const id = value.trim();
  return ID_PATTERN.test(id) ? id : null;
}

async function parseRequestBody(request: Request) {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function parseWriteInput(body: Record<string, unknown> | null) {
  const slug = parseSlug(body?.slug);
  const rating = typeof body?.rating === "number" ? body.rating : Number(body?.rating);
  const text = body?.body === undefined ? "" : body.body;

  if (!slug || !Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  if (typeof text !== "string" || text.trim().length > 500) return null;

  return { slug, rating, body: text.trim() };
}

function parseDeleteInput(body: Record<string, unknown> | null) {
  return parseReviewId(body?.id);
}

function authorNameFor(user: AuthenticatedUser) {
  const candidate = user.displayName?.trim() || user.email?.split("@")[0]?.trim();
  return (candidate || "Utente Mare Nostrum").slice(0, 80);
}

function toPublicReview(row: InternalReviewRow) {
  return {
    id: row.id,
    author: row.author_name,
    rating: row.rating,
    text: row.body.trim() || "Ha lasciato una valutazione.",
    createdAt: row.created_at,
  };
}

function isMissingAuthSessionError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: unknown; message?: unknown };
  return candidate.name === "AuthSessionMissingError" || (
    typeof candidate.message === "string" &&
    candidate.message.toLowerCase().includes("auth session missing")
  );
}

async function createDefaultDependencies(): Promise<BeachReviewsApiDependencies> {
  const client = await createClient();
  if (!client) throw new Error("Supabase public configuration is missing");

  return {
    async getUser() {
      const { data, error } = await client.auth.getUser();
      if (error) {
        if (isMissingAuthSessionError(error)) return null;
        throw error;
      }

      if (!data.user) return null;
      const metadata = data.user.user_metadata as Record<string, unknown> | undefined;
      const displayName = [metadata?.full_name, metadata?.name, metadata?.user_name]
        .find((value): value is string => typeof value === "string" && value.trim().length > 0);

      return {
        id: data.user.id,
        email: data.user.email ?? undefined,
        displayName,
      };
    },

    async findPublishedBeach(slug) {
      const { data, error } = await client
        .from("beaches")
        .select("id")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string } | null;
    },

    async upsert(userId, beachId, input, authorName) {
      const { data, error } = await client
        .from("beach_reviews")
        .upsert(
          {
            beach_id: beachId,
            user_id: userId,
            author_name: authorName,
            rating: input.rating,
            body: input.body,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "beach_id,user_id" },
        )
        .select("id, beach_id, user_id, author_name, rating, body, created_at, updated_at")
        .single();
      if (error) throw error;
      return data as InternalReviewRow;
    },

    async remove(userId, reviewId) {
      const { error } = await client
        .from("beach_reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", userId);
      if (error) throw error;
    },
  };
}

export async function handleBeachReviews(
  request: Request,
  providedDependencies?: BeachReviewsApiDependencies,
) {
  let dependencies: BeachReviewsApiDependencies;
  try {
    dependencies = providedDependencies ?? (await createDefaultDependencies());
  } catch {
    return errorResponse(503, UNAVAILABLE_ERROR);
  }

  let user: AuthenticatedUser | null;
  try {
    user = await dependencies.getUser();
  } catch {
    return errorResponse(503, UNAVAILABLE_ERROR);
  }

  if (!user) return errorResponse(401, AUTH_ERROR);

  if (request.method === "POST") {
    const input = parseWriteInput(await parseRequestBody(request));
    if (!input) return errorResponse(400, "Valutazione non valida");

    try {
      const beach = await dependencies.findPublishedBeach(input.slug);
      if (!beach) return errorResponse(404, "Spiaggia non disponibile");

      const review = await dependencies.upsert(
        user.id,
        beach.id,
        { rating: input.rating, body: input.body },
        authorNameFor(user),
      );
      return Response.json({ ok: true, review: toPublicReview(review) });
    } catch {
      return errorResponse(503, UNAVAILABLE_ERROR);
    }
  }

  if (request.method === "DELETE") {
    const reviewId = parseDeleteInput(await parseRequestBody(request));
    if (!reviewId) return errorResponse(400, "Recensione non valida");

    try {
      await dependencies.remove(user.id, reviewId);
      return Response.json({ ok: true, review: reviewId });
    } catch {
      return errorResponse(503, UNAVAILABLE_ERROR);
    }
  }

  return new Response(null, { status: 405, headers: { allow: "POST, DELETE" } });
}

export async function POST(request: Request) {
  return handleBeachReviews(request);
}

export async function DELETE(request: Request) {
  return handleBeachReviews(request);
}
