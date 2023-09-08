import { Flex } from "@dynatrace/strato-components-preview";
import React from "react";
import { CloudPage } from "../components/aws/CloudPage";

export const APP_NAME = "Cloud Cost App";

export const Home = () => {
  return (
    <Flex flexDirection="column" alignItems="left" padding={32}>
      <CloudPage />
    </Flex>
  );
};
