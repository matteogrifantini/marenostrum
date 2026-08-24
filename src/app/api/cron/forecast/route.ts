import {
  synchronizeProductionForecasts,
  type ForecastSyncResult,
} from "../../../../services/forecast-sync";

export const maxDuration = 60;

export type ForecastCronDependencies = {
  cronSecret: string | undefined;
  synchronize: () => Promise<ForecastSyncResult>;
};

function safeError(status: number) {
  return Response.json({ ok: false }, { status });
}

export async function handleForecastCron(
  request: Request,
  dependencies: ForecastCronDependencies = {
    cronSecret: process.env.CRON_SECRET,
    synchronize: synchronizeProductionForecasts,
  },
) {
  if (!dependencies.cronSecret) {
    return safeError(500);
  }

  if (request.headers.get("authorization") !== `Bearer ${dependencies.cronSecret}`) {
    return safeError(401);
  }

  try {
    const result = await dependencies.synchronize();

    return Response.json({ ok: true, ...result });
  } catch {
    return safeError(502);
  }
}

export async function GET(request: Request) {
  return handleForecastCron(request, {
    cronSecret: process.env.CRON_SECRET,
    synchronize: synchronizeProductionForecasts,
  });
}
