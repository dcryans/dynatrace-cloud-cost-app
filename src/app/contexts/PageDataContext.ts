import { createContext, Dispatch, SetStateAction } from "react";
import { APP_NAME } from "../pages/Home";

export const PageDataContext = createContext<PageData>({
  mainTitle: `Welcome to ${APP_NAME}`,
  setMainTitle: () => {},
  mainSubtitle: "",
  setMainSubtitle: () => {},
  isSidebarDismissed: false,
  setIsSidebarDismissed: () => {},
});

export interface PageData {
  mainTitle: string;
  setMainTitle: Dispatch<SetStateAction<string>>;
  mainSubtitle: string;
  setMainSubtitle: Dispatch<SetStateAction<string>>;
  isSidebarDismissed: boolean;
  setIsSidebarDismissed: Dispatch<SetStateAction<boolean>>;
}
