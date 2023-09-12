import { getEnvironmentUrl } from "@dynatrace-sdk/app-environment";

export function getTenantURL() {
  return getEnvironmentUrl().replace(".apps", ".live");
}

export function getTenantHostname() {
  return new URL(getTenantURL()).hostname
}