/*
 * Created By Eric Horsman and Mandy Swinton
 * DQL and Typescript Help from Ryan Shaw
 *
 * This typscript code looks at all server in the environment and prices them out for AWS with and without resize
 *
 *
 * For information on dynatrace functions go to https://dt-url.net/functions-help
 */

import React, { Fragment, useEffect } from "react";
import { ProgressCircle } from "@dynatrace/strato-components-preview";
import { useDqlQuery } from "@dynatrace-sdk/react-hooks";

interface GetRecordsFromDQLProps {
  query: string;
  setRecords: any;
  label: string;
  firstPropertyOnly?: boolean;
}

export function GetRecordsFromDQL({
  query,
  setRecords,
  label,
  firstPropertyOnly: singlePropertyOnly = false,
}: GetRecordsFromDQLProps) {
  const { data, error, isLoading } = useDqlQuery({
    body: { query: query },
  });

  useEffect(() => {
    if (data === undefined) {
      return;
    }
    let results: any = [];
    if (data?.records && data.records.length > 0 && data.records[0]) {
      if (singlePropertyOnly) {
        const key = Object.keys(data.records[0])[0];
        for (const record of data.records) {
          if (record) {
            const value = record[key];
            if (results.includes(value)) {
              continue;
            } else {
              results.push(record[key]);
            }
          }
        }
      } else {
        results = data.records;
      }
    }
    setRecords(results);
  }, [data, singlePropertyOnly]);

  useEffect(() => {
    if (error) {
      console.log(`Error in ${label} query: ${error}`);
    }
  }, [error]);

  return (
    <Fragment>
      {isLoading && <ProgressCircle>Loading {label}</ProgressCircle>}
      {error && <>Oops, something happened, could not load {label}.</>}
    </Fragment>
  );
}
