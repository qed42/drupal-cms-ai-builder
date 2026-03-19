export interface ProvisioningConfig {
  /** Path to the blueprint JSON file. */
  blueprintPath: string;
  /** Domain for the new site (e.g., "my-clinic.example.com"). */
  domain: string;
  /** Admin email address. */
  email: string;
  /** Site name. */
  siteName: string;
  /** Industry (for content type config). */
  industry: string;
  /** Path to the Drupal root (drupal-site/). */
  drupalRoot: string;
  /** Database configuration. */
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
  /** Platform API callback URL (optional). */
  callbackUrl?: string;
  /** Site ID in the platform. */
  siteId: string;
}

export interface StepResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export type ProvisioningStep = (
  config: ProvisioningConfig
) => Promise<StepResult>;

export interface RollbackAction {
  name: string;
  execute: () => Promise<void>;
}
