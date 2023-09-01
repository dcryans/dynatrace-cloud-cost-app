import { Flex, Link } from "@dynatrace/strato-components-preview";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

export const SidebarContent = () => {
  return (
    <Flex flexDirection="column" paddingTop={16} gap={16}>
      <Flex flexDirection="column">
        <Link as={RouterLink} to={"/"}>
          Home
        </Link>
      </Flex>
    </Flex>
  );
};
