import fs from "node:fs";
import path from "node:path";

export interface ThresholdsConfig {
  version: number;
  competency_demonstrated: {
    min_satisfactory_evidences: number;
    min_distinct_activities: number;
    requires_unaided_transfer_task: boolean;
    retention_check_min_interval_days: number;
    critical_failure_lookback_evidences: number;
  };
  spaced_repetition: {
    initial_ease_factor: number;
    min_ease_factor: number;
    fail_reset_interval_days: number;
    daily_review_cap: number;
    repeated_error_threshold_for_transfer_task: number;
  };
}

let cached: ThresholdsConfig | null = null;

export function loadThresholds(): ThresholdsConfig {
  if (cached) return cached;
  const file = path.join(process.cwd(), "config", "thresholds.json");
  cached = JSON.parse(fs.readFileSync(file, "utf-8"));
  return cached!;
}
