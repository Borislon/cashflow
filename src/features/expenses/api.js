import { supabase } from "../../lib/supabase";

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function fetchExpenses({ from, to, categoryId } = {}) {
  let query = supabase
    .from("expenses")
    .select(
      "id, amount, spent_at, note, scope, category_id, fiscal_memory_no, receipt_no, categories(id, name)",
    )
    .order("spent_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (from) query = query.gte("spent_at", from);
  if (to) query = query.lte("spent_at", to);
  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function findDuplicateReceipt(fiscalMemoryNo, receiptNo) {
  if (!fiscalMemoryNo || !receiptNo) return null;

  const { data, error } = await supabase
    .from("expenses")
    .select("id, amount, spent_at")
    .eq("fiscal_memory_no", fiscalMemoryNo)
    .eq("receipt_no", receiptNo)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createExpense({
  userId,
  amount,
  spentAt,
  categoryId,
  note,
  fiscalMemoryNo = null,
  receiptNo = null,
}) {
  if (fiscalMemoryNo && receiptNo) {
    const duplicate = await findDuplicateReceipt(fiscalMemoryNo, receiptNo);
    if (duplicate) {
      const err = new Error(
        "Тази касова бележка вече е въведена (същият номер на ФП и бележка).",
      );
      err.code = "DUPLICATE_RECEIPT";
      throw err;
    }
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: userId,
      amount,
      spent_at: spentAt,
      category_id: categoryId,
      note: note ?? "",
      scope: "personal",
      family_id: null,
      fiscal_memory_no: fiscalMemoryNo,
      receipt_no: receiptNo,
    })
    .select(
      "id, amount, spent_at, note, scope, category_id, fiscal_memory_no, receipt_no, categories(id, name)",
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      const err = new Error(
        "Тази касова бележка вече е въведена (същият номер на ФП и бележка).",
      );
      err.code = "DUPLICATE_RECEIPT";
      throw err;
    }
    throw error;
  }
  return data;
}

export async function updateExpense(id, { amount, spentAt, categoryId, note }) {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      amount,
      spent_at: spentAt,
      category_id: categoryId,
      note: note ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      "id, amount, spent_at, note, scope, category_id, fiscal_memory_no, receipt_no, categories(id, name)",
    )
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpense(id) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}
