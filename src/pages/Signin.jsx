import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signInUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInUser(email, password);
      if (result.success) {
        navigate("/");
      } else {
        setError(result.error || "Възникна грешка при вход.");
      }
    } catch {
      setError("Възникна неочаквана грешка.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pt-16">
      <form onSubmit={handleSignIn} className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Вход</h1>
        <p className="text-sm text-slate-600">
          Нямаш акаунт?{" "}
          <Link className="underline" to="/signup">
            Регистрация
          </Link>
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Имейл"
          className="rounded-lg border border-slate-300 p-3"
          type="email"
          required
          autoComplete="email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Парола"
          className="rounded-lg border border-slate-300 p-3"
          type="password"
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Влизане…" : "Влез"}
        </button>

        {error && <p className="text-center text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default Signin;
