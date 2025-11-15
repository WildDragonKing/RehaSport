import { Navigate, Route, Routes } from "react-router-dom";

import PageLayout from "./components/layout/PageLayout";
import CategoryPage from "./pages/CategoryPage";
import HomePage from "./pages/HomePage";
import InfoPage from "./pages/InfoPage";
import SessionPage from "./pages/SessionPage";

function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route index element={<HomePage />} />
        <Route path="ordner/:categorySlug" element={<CategoryPage />} />
        <Route path="ordner/:categorySlug/:sessionSlug" element={<SessionPage />} />
        <Route path="info" element={<InfoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
