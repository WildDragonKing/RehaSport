import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";

import { AuthProvider } from "./contexts/AuthContext";
import { ContentProvider } from "./contexts/ContentContext";

// Layouts
import PageLayout from "./components/layout/PageLayout";

// Public Pages (eager load)
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

// Lazy load other pages
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ExerciseDetailPage = lazy(() => import("./pages/ExerciseDetailPage"));
const ExercisesPage = lazy(() => import("./pages/ExercisesPage"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const SessionPage = lazy(() => import("./pages/SessionPage"));
const SessionsPage = lazy(() => import("./pages/SessionsPage"));

// Admin Pages (lazy)
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const BuilderPage = lazy(() => import("./pages/admin/BuilderPage"));
const SessionsManagePage = lazy(() => import("./pages/admin/SessionsManagePage"));
const ExercisesManagePage = lazy(() => import("./pages/admin/ExercisesManagePage"));
const CategoriesPage = lazy(() => import("./pages/admin/CategoriesPage"));
const SessionRulesPage = lazy(() => import("./pages/admin/SessionRulesPage"));
const AnalyticsPage = lazy(() => import("./pages/admin/AnalyticsPage"));
const GroupsPage = lazy(() => import("./pages/admin/GroupsPage"));
const DraftsPage = lazy(() => import("./pages/admin/DraftsPage"));
const TrainersPage = lazy(() => import("./pages/admin/TrainersPage"));
const BulkGeneratorPage = lazy(() => import("./pages/admin/BulkGeneratorPage"));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" />
    </div>
  );
}

function App(): JSX.Element {
  return (
    <AuthProvider>
      <ContentProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PageLayout />}>
              <Route index element={<HomePage />} />
              <Route path="ordner/:categorySlug" element={<CategoryPage />} />
              <Route path="ordner/:categorySlug/:sessionSlug" element={<SessionPage />} />
              <Route path="stunden" element={<SessionsPage />} />
              <Route path="uebungen" element={<ExercisesPage />} />
              <Route path="uebungen/:exerciseSlug" element={<ExerciseDetailPage />} />
              <Route path="info" element={<InfoPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="builder" element={<BuilderPage />} />
              <Route path="stunden" element={<SessionsManagePage />} />
              <Route path="uebungen" element={<ExercisesManagePage />} />
              <Route path="kategorien" element={<CategoriesPage />} />
              <Route path="regeln" element={<SessionRulesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="gruppen" element={<GroupsPage />} />
              <Route path="entwuerfe" element={<DraftsPage />} />
              <Route path="trainer" element={<TrainersPage />} />
              <Route path="generator" element={<BulkGeneratorPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;
