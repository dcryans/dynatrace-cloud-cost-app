/*
 * Created By Eric Horsman and Mandy Swinton
 * DQL and Typescript Help from Ryan Shaw
 *
 * This typscript code looks at all server in the environment and prices them out for AWS with and without resize
 *
 *
 * For information on dynatrace functions go to https://dt-url.net/functions-help
 */

import React, { useCallback } from "react";
import { GetRecordsFromDQL } from "./GetRecordsFromDQL";
import { AWSZoneQuery } from "./queries/AWSQueries";

export const DEFAULT_REGION = "us-east-1";
export const DEFAULT_REGIONS = [
  DEFAULT_REGION,
  "ca-central-1",
  "us-west-1",
  "sa-east-1",
];

interface GetAWSRegionsProps {
  setRegions: any;
  setRegion: any;
}

export function GetAWSRegions({ setRegions, setRegion }: GetAWSRegionsProps) {
  const handleChangeAWSZones = useCallback((records: any[]) => {
    let newRegions: string[] = [];
    let newRegion = DEFAULT_REGION;
    if (records) {
      if (records.length > 0) {
        const regionsToAdd: string[] = [];
        for (const zone of records) {
          const trimmedZone = trimTrailingLetters(zone);
          regionsToAdd.push(trimmedZone);
        }
        newRegions = addRegions(newRegions, regionsToAdd);
        newRegion = newRegions[0];
      }
    }
    newRegions = addRegions(newRegions, DEFAULT_REGIONS);
    setRegions(newRegions);
    setRegion(newRegion, true);
  }, []);

  return (
    <GetRecordsFromDQL
      query={AWSZoneQuery}
      label="Local AWS Regions"
      setRecords={handleChangeAWSZones}
      firstPropertyOnly={true}
    />
  );
}

function addRegions(newRegions: string[], regionsToAdd: string[]): string[] {
  for (const region of regionsToAdd) {
    if (newRegions.includes(region)) {
      continue;
    }
    newRegions.push(region);
  }

  return newRegions;
}

function trimTrailingLetters(inputString: string) {
  // Use a regular expression to remove trailing letters
  return inputString.replace(/[a-zA-Z]+$/, "");
}
