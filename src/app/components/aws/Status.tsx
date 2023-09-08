/*
 * Created By Eric Horsman and Mandy Swinton
 * DQL and Typescript Help from Ryan Shaw
 *
 * This typscript code looks at all server in the environment and prices them out for AWS with and without resize
 *
 *
 * For information on dynatrace functions go to https://dt-url.net/functions-help
 */

import React, { Fragment } from "react";
import { ProgressCircle } from "@dynatrace/strato-components-preview";

import { AsyncStateStatus } from "@dynatrace-sdk/react-hooks/types/packages/util/react-hooks/src/lib/react-async-hook/react-async-hook";

export interface StatusInfo {
  status: AsyncStateStatus;
  statusMessage: string;
}

interface StatusProps {
  statusInfo: StatusInfo;
}

export function Status({ statusInfo: { status, statusMessage } }: StatusProps) {
  return (
    <Fragment>
      {status === "loading" && (
        <ProgressCircle>
          {statusMessage}
        </ProgressCircle>
      )}
      {status === "error" && <>ERROR: {statusMessage}</>}
    </Fragment>
  );
}
