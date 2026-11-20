/**
 * Bulgarian fiscal receipt QR (Наредба Н-18, приложение 18а):
 * FMIN*documentNo*YYYY-MM-DD*HH:MM:SS*amount
 * Example: 01234567*0000000123456789*2017-05-20*12:45:56*45.89
 */

const PAYLOAD_RE =
  /([^*\s]+)\*([^*\s]+)\*(\d{4}-\d{2}-\d{2})\*(\d{2}:\d{2}:\d{2})\*([0-9]+(?:[.,][0-9]{1,2})?)/;

export function parseReceiptQr(raw) {
  if (!raw || typeof raw !== "string") {
    return { ok: false, error: "Празен QR код." };
  }

  const match = raw.trim().match(PAYLOAD_RE);
  if (!match) {
    return {
      ok: false,
      error:
        "Неразпознат QR формат. Очаква се: ФП*номер*ГГГГ-ММ-ДД*ЧЧ:ММ:СС*сума",
    };
  }

  const [, fiscalMemoryNo, receiptNo, spentAt, time, amountRaw] = match;
  const amount = Number(amountRaw.replace(",", "."));

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Невалидна сума в QR кода." };
  }

  return {
    ok: true,
    data: {
      fiscalMemoryNo,
      receiptNo,
      spentAt,
      time,
      amount,
      raw: `${fiscalMemoryNo}*${receiptNo}*${spentAt}*${time}*${amountRaw}`,
    },
  };
}
