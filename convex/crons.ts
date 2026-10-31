import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Publications programmées et entretien.
 * 23:05 UTC = 00:05 à Cotonou (WAT), pour que le défi du jour soit prêt
 * au réveil. La page /defi crée aussi le défi à la demande en secours.
 */
const crons = cronJobs();

crons.daily(
  "publish-daily-challenge",
  { hourUTC: 23, minuteUTC: 5 },
  internal.daily.ensureTodayInternal,
);

// Cycle de vie différé (§13) : expiration + relances douces J+1 / J+3.
// 08:00 UTC = 09:00 à Cotonou.
crons.daily(
  "session-lifecycle",
  { hourUTC: 8, minuteUTC: 0 },
  internal.sessions.lifecycleInternal,
  {},
);

// Rétention (§15.2) : purge hebdomadaire des parties expirées depuis 30 jours.
crons.weekly(
  "retention-purge",
  { dayOfWeek: "sunday", hourUTC: 3, minuteUTC: 0 },
  internal.maintenance.purgeInternal,
  {},
);

export default crons;
