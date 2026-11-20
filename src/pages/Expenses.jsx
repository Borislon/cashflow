import { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import {
  createExpense,
  deleteExpense,
  fetchCategories,
  fetchExpenses,
  updateExpense,
} from "../features/expenses/api";
import {
  formatDate,
  formatMoney,
  todayISODate,
} from "../features/expenses/format";
import { parseReceiptQr } from "../features/receipts/parseQr";
import { canUseNativeQrScan, scanReceiptQr } from "../features/receipts/scan";

const emptyForm = () => ({
  amount: "",
  spentAt: todayISODate(),
  categoryId: "",
  note: "",
  fiscalMemoryNo: null,
  receiptNo: null,
});

const Expenses = () => {
  const { session } = UserAuth();
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    categoryId: "",
  });
  const [form, setForm] = useState(() => emptyForm());
  const [qrPaste, setQrPaste] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const nativeScan = canUseNativeQrScan();

  const loadExpenses = async (nextFilters = filters) => {
    const data = await fetchExpenses({
      from: nextFilters.from || undefined,
      to: nextFilters.to || undefined,
      categoryId: nextFilters.categoryId || undefined,
    });
    setExpenses(data);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [cats, list] = await Promise.all([
          fetchCategories(),
          fetchExpenses(),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setExpenses(list);
        if (cats.length) {
          setForm((prev) =>
            prev.categoryId ? prev : { ...prev, categoryId: cats[0].id },
          );
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setQrPaste("");
    setInfo("");
    setForm({
      ...emptyForm(),
      categoryId: categories[0]?.id ?? "",
    });
  };

  const applyParsedReceipt = (parsed) => {
    setEditingId(null);
    setForm((prev) => ({
      ...prev,
      amount: String(parsed.amount),
      spentAt: parsed.spentAt,
      fiscalMemoryNo: parsed.fiscalMemoryNo,
      receiptNo: parsed.receiptNo,
      note: prev.note,
      categoryId: prev.categoryId || categories[0]?.id || "",
    }));
    setInfo(
      `Попълнено от QR: ${parsed.amount.toFixed(2)} лв. на ${parsed.spentAt}. Избери категория и потвърди.`,
    );
    setError("");
  };

  const handleParsePaste = (e) => {
    e.preventDefault();
    const result = parseReceiptQr(qrPaste);
    if (!result.ok) {
      setError(result.error);
      setInfo("");
      return;
    }
    applyParsedReceipt(result.data);
  };

  const handleScan = async () => {
    setError("");
    setScanning(true);
    try {
      const raw = await scanReceiptQr();
      if (!raw) {
        setInfo("Сканирането е отказано.");
        return;
      }
      setQrPaste(raw);
      const result = parseReceiptQr(raw);
      if (!result.ok) {
        setError(result.error);
        setInfo("");
        return;
      }
      applyParsedReceipt(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleApplyFilters = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await loadExpenses(filters);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      amount: Number(form.amount),
      spentAt: form.spentAt,
      categoryId: form.categoryId,
      note: form.note.trim(),
    };

    try {
      if (editingId) {
        await updateExpense(editingId, payload);
      } else {
        await createExpense({
          userId: session.user.id,
          ...payload,
          fiscalMemoryNo: form.fiscalMemoryNo,
          receiptNo: form.receiptNo,
        });
      }
      resetForm();
      await loadExpenses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setInfo("");
    setForm({
      amount: String(expense.amount),
      spentAt: expense.spent_at,
      categoryId: expense.category_id,
      note: expense.note ?? "",
      fiscalMemoryNo: expense.fiscal_memory_no,
      receiptNo: expense.receipt_no,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Изтриване на този разход?")) return;
    setError("");
    try {
      await deleteExpense(id);
      if (editingId === id) resetForm();
      await loadExpenses();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Разходи</h1>
        <p className="mt-1 text-sm text-slate-600">
          Добавяй ръчно или чрез QR от касова бележка. Семеен бюджет — Фаза 3.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-medium">QR от касова бележка</h2>
        <p className="text-sm text-slate-600">
          Формат НАП: ФП*номер*дата*час*сума. При неуспех въведи ръчно по-долу.
        </p>

        {nativeScan && (
          <button
            type="button"
            onClick={handleScan}
            disabled={scanning}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {scanning ? "Сканиране…" : "Сканирай QR"}
          </button>
        )}

        <form onSubmit={handleParsePaste} className="space-y-2">
          <label className="block text-sm">
            Постави QR текст (тест в браузър / fallback)
            <textarea
              value={qrPaste}
              onChange={(e) => setQrPaste(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 p-3 font-mono text-sm"
              placeholder="01234567*0000000123456789*2017-05-20*12:45:56*45.89"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 font-medium"
          >
            Попълни от текста
          </button>
        </form>

        {form.fiscalMemoryNo && form.receiptNo && (
          <p className="text-xs text-slate-500">
            Бележка: ФП {form.fiscalMemoryNo} · № {form.receiptNo}
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <h2 className="font-medium">
          {editingId ? "Редакция" : "Нов разход"}
        </h2>

        <label className="block text-sm">
          Сума (лв.)
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </label>

        <label className="block text-sm">
          Дата
          <input
            type="date"
            required
            value={form.spentAt}
            onChange={(e) => setForm({ ...form, spentAt: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </label>

        <label className="block text-sm">
          Категория
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Бележка
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            placeholder="по желание"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || !form.categoryId}
            className="flex-1 rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {saving ? "Запис…" : editingId ? "Запази" : "Добави"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-3"
            >
              Отказ
            </button>
          )}
        </div>
      </form>

      <form
        onSubmit={handleApplyFilters}
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <h2 className="font-medium">Филтри</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            От
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters({ ...filters, from: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
            />
          </label>
          <label className="block text-sm">
            До
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
            />
          </label>
        </div>
        <label className="block text-sm">
          Категория
          <select
            value={filters.categoryId}
            onChange={(e) =>
              setFilters({ ...filters, categoryId: e.target.value })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          >
            <option value="">Всички</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 font-medium"
        >
          Приложи
        </button>
      </form>

      {info && <p className="text-sm text-slate-700">{info}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {loading ? (
        <p className="text-slate-600">Зареждане…</p>
      ) : expenses.length === 0 ? (
        <p className="text-slate-600">Няма разходи за този филтър.</p>
      ) : (
        <ul className="space-y-2">
          {expenses.map((expense) => (
            <li
              key={expense.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{formatMoney(expense.amount)}</p>
                  <p className="text-sm text-slate-600">
                    {formatDate(expense.spent_at)} ·{" "}
                    {expense.categories?.name ?? "—"}
                    {expense.fiscal_memory_no ? " · QR" : ""}
                  </p>
                  {expense.note ? (
                    <p className="mt-1 text-sm text-slate-700">{expense.note}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(expense)}
                    className="text-sm underline"
                  >
                    Редакция
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(expense.id)}
                    className="text-sm text-red-600 underline"
                  >
                    Изтрий
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Expenses;
