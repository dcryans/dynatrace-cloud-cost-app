import type { CliOptions } from "dt-app";
import packageJSON from "./package.json";

const config: CliOptions = {
  environmentUrl: "https://egu21862.apps.dynatrace.com/",
  icon: "./src/assets/icon.png",
  app: {
    name: "Cloud Cost App",
    version: packageJSON.version,
    description:
      "App that delivers information on an environemnt's cloud costs.",
    id: "my.cloud.cost.app",
    scopes: [
      { name: "storage:logs:read", comment: "default template" },
      { name: "storage:buckets:read", comment: "default template" },
      { name: "storage:metrics:read", comment: "default template" },
      { name: "storage:entities:read", comment: "default template" },
      { name: "document:documents:write", comment: "Create Documents" },
      { name: "document:documents:read", comment: "Read Documents" },
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
