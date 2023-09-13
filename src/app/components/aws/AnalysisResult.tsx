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
  Container,
  Divider,
  Flex,
  Heading,
  Markdown,
  Text,
} from "@dynatrace/strato-components-preview";
import { ResultTable } from "./ResultTable";
import { AnalysisResults } from "./hooks/useAWSAnalysisResults";

interface AnalysisResultProps {
  awsAnalysisResults: AnalysisResults;
}

const BLUE_LINE_MD =
  "![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABy8AAAAMCAYAAADbJPG3AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAACdSURBVHhe7dtBFcAgDETBUBtFA6KrDhf0gofsYeay8fBfRn37FAAAAAAAAECz5y4AAAAAAABAK/ESAAAAAAAAiCBeAgAAAAAAABHESwAAAAAAACCCeAkAAAAAAABEEC8BAAAAAACACOIlAAAAAAAAEGG8c517AwAAAAAAALTxeQkAAAAAAABEEC8BAAAAAACACOIlAAAAAAAAEKDqB2IIBAQ2TEouAAAAAElFTkSuQmCC)";

export function AnalysisResult({awsAnalysisResults}: AnalysisResultProps) {

  return (
    <Fragment>
      {awsAnalysisResults && (
        <Fragment>
          <Markdown>{BLUE_LINE_MD}</Markdown>
          <Container>
            <Heading level={4}>
              AWS Yearly Cost Estimate(base on list price) and Rightsizing
              Summary
            </Heading>
            <Text>
              Overall environment size and yearly pricing. Pricing(yearly) based
              on AWS list price ({awsAnalysisResults.region})
            </Text>
            <Divider />
            <Flex flexItem mt={8}>
              <ResultTable result={awsAnalysisResults.sum_results} />
            </Flex>
          </Container>
          <Markdown>{BLUE_LINE_MD}</Markdown>
          <Container>
            <Heading level={4}>
              AWS Cost Estimate and Rightsizing Server Details (hourly)
            </Heading>
            <Text>
              AWS Pricing of Instances based upon sizing direct and right
              Sizing. Pricing(hourly) based on AWS list price ({awsAnalysisResults.region})
            </Text>
            <Divider />
            <Flex flexItem mt={8}>
              <ResultTable result={awsAnalysisResults.utili_results} />
            </Flex>
          </Container>
        </Fragment>
      )}
      </Fragment>
  );
}
