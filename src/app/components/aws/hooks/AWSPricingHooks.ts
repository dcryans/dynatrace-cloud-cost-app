import React, { useState, useCallback, useEffect, useMemo } from "react";
import { functions } from "@dynatrace-sdk/app-utils";
import {
  useCreateDocument,
  useListDocuments,
  useDocument,
  useUpdateDocument,
} from "@dynatrace-sdk/react-hooks";
import { AsyncStateStatus } from "@dynatrace-sdk/react-hooks/types/packages/util/react-hooks/src/lib/react-async-hook/react-async-hook";
import { StatusInfo } from "../Status";

const AWSDocumentType = "AWSPricing";

export const useAWSPricingDocumentListGet = (region: string) => {
  const [mostRecentDocumentId, setMostRecentDocumentId] = useState("");
  const [outdatedDocumentInfo, setOutdatedDocumentInfo] = useState({
    id: "",
    version: "",
  });

  const [isMissingDocument, setIsMissingDocument] = useState(false);
  const { data, error, status, refetch } = useListDocuments({
    filter: `name = '${region}' and type = '${AWSDocumentType}'`,
  });
  useMemo(() => {
    let doFetch = false;
    if (mostRecentDocumentId! !== "") {
      setMostRecentDocumentId("");
      doFetch = true;
    }
    if (outdatedDocumentInfo.id !== "") {
      setOutdatedDocumentInfo({
        id: "",
        version: "",
      });
      doFetch = true;
    }
    if (doFetch) {
      refetch();
    }
  }, [region]);

  const statusInfo = useStatusInfo(
    error,
    status,
    "Retriving list of cached AWS Pricing data"
  );

  useEffect(() => {
    if (region === "") {
      return;
    }
    if (data) {
      if (data?.totalCount === 0) {
        setIsMissingDocument(true);
      } else {
        let mostRecentDocument = data.documents[0];
        for (const document of data.documents) {
          if (
            document.modificationInfo.lastModifiedTime >
            mostRecentDocument.modificationInfo.lastModifiedTime
          ) {
            mostRecentDocument = document;
          }
        }
        if (isToday(mostRecentDocument.modificationInfo.lastModifiedTime)) {
          setMostRecentDocumentId(mostRecentDocument.id);
        } else {
          setOutdatedDocumentInfo({
            id: mostRecentDocument.id,
            version: mostRecentDocument.version,
          });
        }
      }
    }
  }, [data]);

  return {
    statusInfo,
    mostRecentDocumentId,
    isMissingDocument,
    outdatedDocumentInfo,
  };
};

export const useStatusInfo = (
  error: any,
  status: AsyncStateStatus,
  label: string,
  statusSuffixes?: any
): StatusInfo => {
  useEffect(() => {
    if (error) {
      console.log(`ERROR in ${label} : ${error}`);
    }
  }, [error, label]);

  return useMemo<StatusInfo>(() => {
    let statusMessage = "";

    let statusSuffix = "";
    if (statusSuffixes && status in statusSuffixes) {
      statusSuffix = statusSuffixes[status];
    }

    if (status === "loading") {
      statusMessage = `${label} ${statusSuffix}`;
    } else if (status === "error") {
      statusMessage = `Failed: ${label} ${statusSuffix}`;
    }
    return { status, statusMessage };
  }, [status, label, statusSuffixes]);
};

export const useAWSPricingGet = (
  region: string,
  isMissingDocument: boolean,
  outdatedDocumentId: string,
  setInstanceTypes: any
) => {
  const [records, setRecords] = useState(undefined);
  const [status, setStatus] = useState<AsyncStateStatus>("not-requested");

  useMemo(() => {
    if (records != undefined) {
      setRecords(undefined);
    }
    if (status != "not-requested") {
      setStatus("not-requested");
    }
  }, [region]);

  const statusInfo = useStatusInfo(
    undefined,
    status,
    "Retriving pricing from AWS",
    {
      loading: "(Please don't refresh, estimated 30s)",
    }
  );

  const getPricingFromAWS = useCallback(
    (region: string) => {
      setStatus("loading");
      functions
        .call("get-aws-pricing", {
          region,
        })
        .then((result) => {
          setStatus("success");
          return result.json();
        })
        .then((instanceTypesObject) => {
          if (
            instanceTypesObject?.records &&
            instanceTypesObject?.records.length > 0
          ) {
            setRecords(instanceTypesObject.records);
            setInstanceTypes(instanceTypesObject.records);
          } else {
            setStatus("error");
          }
        })
        .catch((error) => {
          console.log(`Error in getPricingFromAWS: ${error}`);
          setStatus("error");
        });
    },
    [setStatus, setRecords, setInstanceTypes]
  );

  useEffect(() => {
    if (isMissingDocument || outdatedDocumentId !== "") {
      getPricingFromAWS(region);
    }
  }, [isMissingDocument, outdatedDocumentId, region]);

  return { statusInfo, records };
};

export const useAWSPricingDocumentCreate = (
  region: string,
  isMissingDocument: boolean,
  records: any
) => {
  const { status, execute, error } = useCreateDocument();
  const statusInfo = useStatusInfo(
    error,
    status,
    "Saving new AWS Pricing data cache"
  );

  const createAWSPricingDocument = useCallback(
    (records) => {
      if (records) {
        const blob = JSONObjectToBlob(records);
        execute({
          body: {
            name: region,
            content: blob,
            type: AWSDocumentType,
          },
        });
      }
    },
    [region, execute]
  );

  useEffect(() => {
    if (isMissingDocument && records) {
      createAWSPricingDocument(records);
    }
  }, [isMissingDocument, records]);

  return { statusInfo };
};

export const useAWSPricingDocumentUpdate = (
  region: string,
  outdatedDocumentInfo: { id: string; version: string },
  records: any
) => {
  const { status, execute, error } = useUpdateDocument();
  const statusInfo = useStatusInfo(
    error,
    status,
    "Updating AWS Pricing data cache"
  );

  const updateAWSPricingDocument = useCallback(
    (region, outdatedDocumentInfo, records) => {
      if (records) {
        const blob = JSONObjectToBlob(records);
        execute({
          id: outdatedDocumentInfo.id,
          optimisticLockingVersion: outdatedDocumentInfo.version,
          body: {
            name: region,
            content: blob,
            type: AWSDocumentType,
          },
        });
      }
    },
    [execute]
  );

  useEffect(() => {
    if (outdatedDocumentInfo.id !== "" && records) {
      updateAWSPricingDocument(region, outdatedDocumentInfo, records);
    }
  }, [region, outdatedDocumentInfo, records]);

  return { statusInfo };
};

export const useAWSPricingDocumentGet = (id: string, setInstanceTypes: any) => {
  const { status, error, data, refetch } = useDocument(
    { id },
    { autoFetch: false }
  );

  const statusInfo = useStatusInfo(
    error,
    status,
    "Retriving cached AWS Pricing data"
  );

  useEffect(() => {
    if (id !== "") {
      refetch();
    }
  }, [id]);

  useEffect(() => {
    if (data?.content) {
      data?.content.get("json").then((json) => {
        setInstanceTypes(json);
      });
    }
  }, [data]);

  return { statusInfo };
};

function JSONObjectToBlob(object: any) {
  const str = JSON.stringify(object);
  const bytes = new TextEncoder().encode(str);
  const blob = new Blob([bytes], {
    type: "application/json;charset=utf-8",
  });
  return blob;
}

const isToday = (someDate: Date) => {
  const today = new Date();
  return (
    someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
  );
};
