import { Button } from "@dynatrace/strato-components-preview";
import { TitleBar } from "@dynatrace/strato-components-preview/layouts";
import { XmarkIcon } from "@dynatrace/strato-icons";
import React, { useContext } from "react";
import { PageDataContext } from "../../contexts/PageDataContext";

export const NavigationSidebarTitleBar = () => {
  const { setIsSidebarDismissed } = useContext(PageDataContext);
  return (
    <TitleBar>
      <TitleBar.Title>Navigate</TitleBar.Title>
      <TitleBar.Action>
        <Button
          onClick={() => setIsSidebarDismissed(true)}
          aria-label="Close sidebar"
        >
          <Button.Prefix>
            <XmarkIcon />
          </Button.Prefix>
        </Button>
      </TitleBar.Action>
    </TitleBar>
  );
};
