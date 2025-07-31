import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Home from "./home/index.jsx";
import Dashboard from "./dashboard/index.jsx";
import LoginSignup from "./auth/sign-in/index.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import ViewResume from "./my-resume/[resumeId]/view/index.jsx";
import SharedResumeView from "./shared/resume/view/index.jsx";
import EditResume from "./dashboard/resume/[resumeId]/edit/index.jsx";
import CreationModeSelector from "./components/ResumeCreation/CreationModeSelector.jsx";
import TemplateGallery from "./components/ResumeCreation/TemplateGallery.jsx";
import TemplateForm from "./components/ResumeCreation/TemplateForm.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import TermsOfService from "./legal/TermsOfService.jsx";
import Contact from "./contact/index.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
        index: true,
      },
      {
        path: "/register",
        element: <LoginSignup />,
      },
      {
        path: "/auth/sign-in",
        element: <LoginSignup />,
      },
      {
        path: "/terms-of-service",
        element: <TermsOfService />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/my-resume/:email/:resumeId/view",
        element: <SharedResumeView />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/create",
            element: <CreationModeSelector />,
          },
          {
            path: "/create/templates",
            element: <TemplateGallery />,
          },
          {
            path: "/create/templates/:templateId",
            element: <TemplateForm />,
          },
          {
            path: "/dashboard/resume/edit-template/:resumeId",
            element: <TemplateForm />,
          },
          {
            path: "/dashboard/:email/:resumeId/edit",
            element: <EditResume />,
          },
          {
            path: "/dashboard/:email/:resumeId/view",
            element: <ViewResume />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>,
);
