export type SicilianWebcamVerificationRecord = {
  source_url: string;
  status: "online" | "offline" | "unknown" | "stale";
  verification_note: string;
};

export type SicilianContentVerificationIssue = {
  index: number;
  code:
    | "record_not_object"
    | "source_url_invalid"
    | "source_unknown"
    | "duplicate_source"
    | "status_invalid"
    | "verification_note_missing";
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isHttpUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSicilianWebcamVerificationCatalog(
  input: unknown[],
  candidateSourceUrls: ReadonlySet<string>,
): { records: SicilianWebcamVerificationRecord[]; issues: SicilianContentVerificationIssue[] } {
  const records: SicilianWebcamVerificationRecord[] = [];
  const issues: SicilianContentVerificationIssue[] = [];
  const seenSources = new Set<string>();

  input.forEach((value, index) => {
    if (!isRecord(value)) {
      issues.push({ index, code: "record_not_object", message: "Verification record must be an object" });
      return;
    }

    const issueCountBefore = issues.length;
    const sourceUrl = value.source_url;
    if (!isHttpUrl(sourceUrl)) {
      issues.push({ index, code: "source_url_invalid", message: "source_url must be an HTTP(S) URL" });
    } else if (!candidateSourceUrls.has(sourceUrl)) {
      issues.push({ index, code: "source_unknown", message: `Unknown webcam source: ${sourceUrl}` });
    } else if (seenSources.has(sourceUrl)) {
      issues.push({ index, code: "duplicate_source", message: `Duplicate webcam source: ${sourceUrl}` });
    } else {
      seenSources.add(sourceUrl);
    }

    if (!isNonEmptyString(value.verification_note)) {
      issues.push({ index, code: "verification_note_missing", message: "verification_note is required" });
    }

    if (!isNonEmptyString(value.status) || !["online", "offline", "unknown", "stale"].includes(value.status)) {
      issues.push({ index, code: "status_invalid", message: "status must be online, offline, unknown, or stale" });
    }

    if (issues.length === issueCountBefore) {
      records.push(value as SicilianWebcamVerificationRecord);
    }
  });

  return { records, issues };
}
