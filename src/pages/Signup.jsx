import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signup = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUpNewUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUpNewUser(email, password, displayName.trim());
      if (result.success) {
        navigate("/signin");
      } else {
        setError(result.error || "Възникна грешка при регистрация.");
      }
    } catch {
      setError("Възникна неочаквана грешка.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pt-16">
      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Регистрация</h1>
        <p className="text-sm text-slate-600">
          Вече имаш акаунт?{" "}
          <Link className="underline" to="/signin">
            Вход
          </Link>
        </p>

        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Име"
          className="rounded-lg border border-slate-300 p-3"
          type="text"
          required
          autoComplete="name"
        />
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
          minLength={6}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Създаване…" : "Създай акаунт"}
        </button>

        {error && <p className="text-center text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default Signup;
