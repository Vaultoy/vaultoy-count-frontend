import { Route, Routes } from "react-router";
import { AppHomePage } from "./AppHome/AppHome";
import { GroupPage } from "./GroupPage/GroupPage";
import { Navbar } from "./Navbar";

export const SCApp = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<AppHomePage />} />
        <Route path="/group/:groupId" element={<GroupPage />} />
      </Routes>
    </>
  );
};
