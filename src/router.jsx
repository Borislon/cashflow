import { createBrowserRouter, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import AppShell from "./layouts/AppShell";
import Analytics from "./pages/Analytics";
import Expenses from "./pages/Expenses";
import Family from "./pages/Family";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";

export const router = createBrowserRouter([
  { path: "/signup", element: <Signup /> },
  { path: "/signin", element: <Signin /> },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <AppShell />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "expenses", element: <Expenses /> },
      { path: "analytics", element: <Analytics /> },
      { path: "family", element: <Family /> },
      { path: "profile", element: <Profile /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
