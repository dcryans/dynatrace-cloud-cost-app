import { Button } from '@dynatrace/strato-components-preview';
import { TitleBar } from '@dynatrace/strato-components-preview/layouts';
import { CloseSidebarIcon, OpenSidebarIcon } from '@dynatrace/strato-icons';
import React, { useContext } from 'react';
import { PageDataContext } from '../../contexts/PageDataContext';

export const MainTitleBar = () => {
  const {
    mainTitle,
    mainSubtitle,
    isSidebarDismissed,
    setIsSidebarDismissed,
  } = useContext(PageDataContext);
  return (
    <TitleBar>
      <TitleBar.Prefix>
        <Button
          onClick={() => setIsSidebarDismissed((prevValue) => !prevValue)}
          aria-label={`${isSidebarDismissed ? 'Open' : 'Close'} sidebar`}
        >
          <Button.Suffix>{isSidebarDismissed ? <OpenSidebarIcon /> : <CloseSidebarIcon />}</Button.Suffix>
        </Button>
      </TitleBar.Prefix>
      <TitleBar.Title>{mainTitle}</TitleBar.Title>
      <TitleBar.Subtitle>{mainSubtitle}</TitleBar.Subtitle>
    </TitleBar>
  );
};
