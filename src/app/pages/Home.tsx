import {
  Container,
  Divider,
  Flex,
  Heading,
  Markdown,
  Text,
} from "@dynatrace/strato-components-preview";
import React from "react";
import { AWSPriceTables } from "../components/aws/AWSPriceTables";

export const APP_NAME = "Cloud Cost App";


export const Home = () => {
  return (
    <Flex flexDirection="column" alignItems="left" padding={32}>
      <AWSPriceTables />
    </Flex>
  );
};
