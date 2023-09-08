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
import {
  useAWSPricingDocumentListGet,
  useAWSPricingDocumentGet,
  useAWSPricingGet,
  useAWSPricingDocumentUpdate,
  useAWSPricingDocumentCreate,
} from "./hooks/AWSPricingHooks";
import { Status } from "./Status";

interface GetInstanceTypesProps {
  setInstanceTypes: any;
  region: string;
}

export function GetInstanceTypes({
  setInstanceTypes,
  region,
}: GetInstanceTypesProps) {
  const documentListState = useAWSPricingDocumentListGet(region);
  const documentState = useAWSPricingDocumentGet(
    documentListState.mostRecentDocumentId,
    setInstanceTypes
  );
  const pricingFromAWSState = useAWSPricingGet(
    region,
    documentListState.isMissingDocument,
    documentListState.outdatedDocumentInfo.id,
    setInstanceTypes
  );
  const documentCreateState = useAWSPricingDocumentCreate(
    region,
    documentListState.isMissingDocument,
    pricingFromAWSState.records
  );
  const documentUpdateState = useAWSPricingDocumentUpdate(
    region,
    documentListState.outdatedDocumentInfo,
    pricingFromAWSState.records
  );

  return (
    <Fragment>
      <Status statusInfo={documentListState.statusInfo}></Status>
      <Status statusInfo={documentState.statusInfo}></Status>
      <Status statusInfo={pricingFromAWSState.statusInfo}></Status>
      <Status statusInfo={documentCreateState.statusInfo}></Status>
      <Status statusInfo={documentUpdateState.statusInfo}></Status>
    </Fragment>
  );
}
