import type { CliOptions } from "dt-app";

const config: CliOptions = {
  environmentUrl: "https://egu21862.apps.dynatrace.com/",
  icon: "./src/assets/icon.png",
  app: {
    name: "Cloud Cost App",
    version: "0.0.6",
    description:
      "App that delivers information on an environemnt's cloud costs.",
    id: "my.cloud.cost.app",
    scopes: [
      { name: "storage:logs:read", comment: "default template" },
      { name: "storage:buckets:read", comment: "default template" },
      { name: "storage:metrics:read", comment: "default template" },
      { name: "storage:entities:read", comment: "default template" },
      {
        name: "environment-api:entities:read",
        comment: "get entities from tenant",
      },
      {
        name: "settings:objects:read",
        comment: "get settings objects",
      },
      {
        name: "settings:objects:write",
        comment: "update settings objects",
      },
      {
        name: "environment-api:api-tokens:write",
        comment: "Create Installer token",
      },
    ],
  },
};

module.exports = config;
