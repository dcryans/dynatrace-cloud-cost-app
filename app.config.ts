import type { CliOptions } from "dt-app";
import packageJSON from "./package.json";

const config: CliOptions = {
  environmentUrl: "https://egu21862.apps.dynatrace.com/",
  icon: "./src/assets/icon.png",
  app: {
    name: "Rightsize",
    version: packageJSON.version,
    description:
      "Rightsize cloud infrastructure and create large scale savings.",
    id: "my.rightsize",
    scopes: [
      { name: "storage:buckets:read", comment: "needed for every DQL queries" },
      { name: "storage:metrics:read", comment: "default template" },
      { name: "storage:entities:read", comment: "default template" },
      { name: "document:documents:write", comment: "Create Documents" },
      { name: "document:documents:read", comment: "Read Documents" },
      {
        name: "environment-api:entities:read",
        comment: "get entities from tenant",
      },
    ],
  },
};

module.exports = config;
