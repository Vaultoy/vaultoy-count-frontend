import { Route, Routes } from "react-router";
import { AppHomePage } from "./AppHome/AppHome";
import { GroupPage } from "./GroupPage/GroupPage";
import { ErrorPage } from "../ErrorPage";

export const SCApp = () => {
  return (
    <Routes>
      <Route path="/" element={<AppHomePage />} />
      <Route path="/group/:groupId" element={<GroupPage />} />
      <Route
        path="*"
        element={
          <ErrorPage
            title="404 - Page Not Found"
            description="Unfortunately, the app page you were looking for was not found."
          />
        }
      />
    </Routes>
  );
};
