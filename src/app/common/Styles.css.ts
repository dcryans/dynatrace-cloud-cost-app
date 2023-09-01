import {
  Container,
  ExternalLink,
  Flex,
} from "@dynatrace/strato-components-preview";
import styled from "styled-components";

export const FlexNonScrollable = styled(Flex)`
  overflow: hidden;
  height: 100%;
`;

export const FlexVerticallyScrollable = styled(Flex)`
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 100%;
`;

export const FlexFullHeight = styled(Flex)`
  height: 100%;
`;

export const ContainerNonScrollable = styled(Container)`
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
`;

export const TabsFlexNonScrollable = styled(Flex)`
  height: 100%;
  overflow: hidden;

  & > div {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  & > div > div:nth-of-type(2) {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  & > div > div:nth-of-type(2) > div {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`;

export const DataTableFlexNonScrollable = styled(Flex)`
  max-height: 100%;
  overflow: hidden;
  display: flex;

  & > div {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  & > div > div:nth-of-type(1) {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  & > div > div:nth-of-type(1) > div:nth-of-type(1) {
    overflow: hidden;
    display: flex;
    flex-direction: row;
  }

  & > div > div:nth-of-type(1) > div:nth-of-type(2) {
    overflow: scroll;
    height: 100%;
    display: flex;
    box-sizing: border-box;
  }
`;

export const MarginTopFlex = styled(Flex)`
  margin-top: 7vw;
  text-align: center;

  & > * {
    margin: 20px;
  }

  & > section > * {
    margin: 5px;
  }
`;

export const NoUnderlineExternalLink = styled(ExternalLink)`
  text-decoration: none;
`;
