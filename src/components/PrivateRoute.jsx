import { Navigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { session } = UserAuth();

  if (session === undefined) {
    return <p className="p-6 text-center text-slate-600">Зареждане…</p>;
  }

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default PrivateRoute;
