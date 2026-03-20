import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

/**
 * Build common headers for callback requests.
 */
function callbackHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const apiKey = process.env.PROVISION_CALLBACK_KEY;
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  return headers;
}

export async function callbackStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  if (!config.callbackUrl) {
    logger.info("No callback URL configured, skipping.", {
      step: "callback",
    });
    return { success: true, message: "No callback configured" };
  }

  const payload = {
    site_id: config.siteId,
    status: "live",
    url: `https://${config.domain}`,
    domain: config.domain,
  };

  const response = await fetch(config.callbackUrl, {
    method: "POST",
    headers: callbackHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Callback failed: ${response.status} ${response.statusText}`
    );
  }

  logger.info(`Callback sent to ${config.callbackUrl}.`, {
    step: "callback",
  });

  return {
    success: true,
    message: `Callback sent: site ${config.siteId} is live at https://${config.domain}`,
  };
}

/**
 * Send a failure callback to update the platform about provisioning failure.
 * This is called from the orchestrator on error, not as a pipeline step.
 */
export async function sendFailureCallback(
  config: ProvisioningConfig,
  errorMessage: string,
  logger: winston.Logger,
  stepDetail?: { failedStep: number; failedStepName: string; totalSteps: number }
): Promise<void> {
  if (!config.callbackUrl) return;

  try {
    const payload: Record<string, unknown> = {
      site_id: config.siteId,
      status: "failed",
      error: errorMessage,
    };

    if (stepDetail) {
      payload.failed_step = stepDetail.failedStep;
      payload.failed_step_name = stepDetail.failedStepName;
      payload.total_steps = stepDetail.totalSteps;
    }

    await fetch(config.callbackUrl, {
      method: "POST",
      headers: callbackHeaders(),
      body: JSON.stringify(payload),
    });

    logger.info("Failure callback sent to platform.", { step: "callback" });
  } catch (err) {
    logger.warn(`Could not send failure callback: ${err}`, {
      step: "callback",
    });
  }
}

/**
 * Send a progress callback to update the platform about provisioning step progress.
 * Non-fatal — silently ignores failures so provisioning continues.
 */
export async function sendProgressCallback(
  config: ProvisioningConfig,
  currentStep: number,
  totalSteps: number,
  stepLabel: string,
  logger: winston.Logger
): Promise<void> {
  if (!config.callbackUrl) return;

  try {
    const payload = {
      site_id: config.siteId,
      status: "progress",
      current_step: currentStep,
      total_steps: totalSteps,
      step_label: stepLabel,
    };

    await fetch(config.callbackUrl, {
      method: "POST",
      headers: callbackHeaders(),
      body: JSON.stringify(payload),
    });
  } catch {
    // Progress callbacks are non-fatal — don't block provisioning.
  }
}
