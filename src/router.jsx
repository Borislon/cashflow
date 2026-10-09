import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./Pages/Signup";
import Signin from "./Pages/Singin";
import Dashboard from "./Pages/Dashboard";

export const router = createBrowserRouter([
    {path: "/", element: <App /> },
    {path: "/signup", element: <Signup /> },
    {path: "/signin", element: <Signin /> },
    {path: "/dashboard", element: <Dashboard /> }
]); 