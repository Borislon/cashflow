import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const Profile = () => {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!session?.user?.id) return;

      setLoadingProfile(true);
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setDisplayName(
          data?.display_name ||
            session.user.user_metadata?.display_name ||
            "",
        );
      }
      setLoadingProfile(false);
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", session.user.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Профилът е записан.");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Профил</h1>
        <p className="mt-1 text-sm text-slate-600">{session?.user?.email}</p>
      </div>

      {loadingProfile ? (
        <p className="text-slate-600">Зареждане…</p>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <label className="text-sm font-medium" htmlFor="displayName">
            Име
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-lg border border-slate-300 p-3"
            type="text"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {saving ? "Запис…" : "Запази"}
          </button>
        </form>
      )}

      {message && <p className="text-green-700">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSignOut}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 font-medium"
      >
        Изход
      </button>
    </section>
  );
};

export default Profile;
