import { Navigate, Route, Routes } from "react-router-dom";

import PageLayout from "./components/layout/PageLayout";
import ContactPage from "./pages/ContactPage";
import CoursesPage from "./pages/CoursesPage";
import HomePage from "./pages/HomePage";
import InfoPage from "./pages/InfoPage";

function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route index element={<HomePage />} />
        <Route path="kurse" element={<CoursesPage />} />
        <Route path="info" element={<InfoPage />} />
        <Route path="kontakt" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
