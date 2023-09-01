import { useContext, useState } from "react";
import { PageDataContext } from "../contexts/PageDataContext";

export const useInitPageData = () => {
  const defaultPageData = useContext(PageDataContext);

  const [mainTitle, setMainTitle] = useState(defaultPageData.mainTitle);
  const [mainSubtitle, setMainSubtitle] = useState(
    defaultPageData.mainSubtitle
  );
  const [isSidebarDismissed, setIsSidebarDismissed] = useState(
    defaultPageData.isSidebarDismissed
  );

  return {
    mainTitle,
    setMainTitle,
    mainSubtitle,
    setMainSubtitle,
    isSidebarDismissed,
    setIsSidebarDismissed,
  };
};
