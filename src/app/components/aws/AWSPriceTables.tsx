/*
 * Created By Eric Horsman and Mandy Swinton
 * DQL and Typescript Help from Ryan Shaw
 *
 * This typscript code looks at all server in the environment and prices them out for AWS with and without resize
 *
 *
 * For information on dynatrace functions go to https://dt-url.net/functions-help
 */

import React, { Fragment, useEffect, useMemo, useState } from "react";
import { queryExecutionClient } from "@dynatrace-sdk/client-query";
import { functions } from "@dynatrace-sdk/app-utils";
import {
  AWSPriceJsonFile,
  PriceTableYearly,
  entitiesQuery,
} from "./PriceTableYearly";
import {
  Container,
  Divider,
  Flex,
  Heading,
  Markdown,
  Text,
} from "@dynatrace/strato-components-preview";
import { PriceTableHourly } from "./PriceTableHourly";
//import * as fs from 'fs';
//import React, { useState } from 'react';
//import ReactDOM from 'react-dom';
//import findLeastCostInstance from ./aws_least_cost_details.ts;  /not used yet

// *****************************************************************************************************
// ******************                ADJUST ONLY these two variables.
//  ****************************************************************************************************

const Target_Util = 50;
export const TARGET_UTILIZATION = Target_Util / 100;

interface InstanceType {
  vcpu: number;
  memory: number;
  os: string;
  price: number;
  instanceType: string;
}
const BLUE_LINE_MD =
  "![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABy8AAAAMCAYAAADbJPG3AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAACdSURBVHhe7dtBFcAgDETBUBtFA6KrDhf0gofsYeay8fBfRn37FAAAAAAAAECz5y4AAAAAAABAK/ESAAAAAAAAiCBeAgAAAAAAABHESwAAAAAAACCCeAkAAAAAAABEEC8BAAAAAACACOIlAAAAAAAAEGG8c517AwAAAAAAALTxeQkAAAAAAABEEC8BAAAAAACACOIlAAAAAAAAEKDqB2IIBAQ2TEouAAAAAElFTkSuQmCC)";

export function AWSPriceTables() {
  const [servers, setServers] = useState<any | undefined>(undefined);
  const [instanceTypes, setInstanceTypes] = useState<any | undefined>(
    undefined
  );

  useEffect(() => {
    // Execute Query and set result array to servers array
    const timeout = 60;
    queryExecutionClient
      .queryExecute({
        body: {
          query: entitiesQuery,
          requestTimeoutMilliseconds: timeout * 1000,
          fetchTimeoutSeconds: timeout,
        },
      })
      .then((response) => {
        if (response?.result?.records) {
          return response.result.records;
        }
      })
      .then((serversRecords) => {
        setServers(serversRecords);
      });
  }, []);

  useEffect(() => {
    functions
      .call("outside-call", {
        url: AWSPriceJsonFile,
      })
      .then((result) => {
        return result.json();
      })
      .then((instanceTypesObject) => {
        setInstanceTypes(instanceTypesObject.records);
      });
  }, []);

  const components = useMemo(() => {
    if (servers && instanceTypes) {
      const props = { servers, instanceTypes };

      return (
        <Fragment>
          <Markdown>{BLUE_LINE_MD}</Markdown>
          <Container>
            <Heading level={4}>
              AWS Yearly Cost Estimate(base on list price) and Rightsizing
              Summary
            </Heading>
            <Text>
              Overall environment size and yearly pricing. Pricing(yearly) based
              on AWS list price (AWS_East1)
            </Text>
            <Divider />
            <Flex flexItem mt={8}>
              <PriceTableYearly {...props} />
            </Flex>
          </Container>
          <Markdown>{BLUE_LINE_MD}</Markdown>
          <Container>
            <Heading level={4}>
              AWS Cost Estimate and Rightsizing Server Details (hourly)
            </Heading>
            <Text>
              AWS Pricing of Instances based upon sizing direct and right
              Sizing. Pricing(hourly) based on AWS list price (AWS_East1)
            </Text>
            <Divider />
            <Flex flexItem mt={8}>
              <PriceTableHourly {...props} />
            </Flex>
          </Container>
        </Fragment>
      );
    }
    return null;
  }, [servers, instanceTypes]);

  return <Fragment>{components}</Fragment>;
}
