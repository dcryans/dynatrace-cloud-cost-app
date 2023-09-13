import { Page, ToastContainer } from "@dynatrace/strato-components-preview";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { useInitPageData } from "./hooks/usePageHooks";
import { NavigationSidebarTitleBar } from "./components/page/NavigationSidebarTitleBar";
import { SidebarContent } from "./components/page/SidebarContent";
import { PageDataContext } from "./contexts/PageDataContext";
import { FlexFullHeight } from "./common/Styles.css";
import { MainTitleBar } from "./components/page/MainTitleBar";

export const App = () => {
  const pageState = useInitPageData();

  const getPageWithSideBarCallback = React.useCallback(
    (pageComponent: JSX.Element) => {
      return (
        <Page>
          <Page.Sidebar dismissed={pageState.isSidebarDismissed}>
            <NavigationSidebarTitleBar />
            <SidebarContent />
          </Page.Sidebar>
          <Page.Main>
            <FlexFullHeight flexDirection="column">
              <MainTitleBar />
              {pageComponent}
            </FlexFullHeight>
            <ToastContainer />
          </Page.Main>
        </Page>
      );
    },
    [pageState]
  );

  return (
    <PageDataContext.Provider value={pageState}>
      <Page>
        <Routes>
          <Route path="/" element={getPageWithSideBarCallback(<Home />)} />
        </Routes>
      </Page>
    </PageDataContext.Provider>
  );
};
