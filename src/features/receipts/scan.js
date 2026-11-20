import { Capacitor } from "@capacitor/core";
import {
  BarcodeFormat,
  BarcodeScanner,
} from "@capacitor-mlkit/barcode-scanning";

export function canUseNativeQrScan() {
  return Capacitor.isNativePlatform();
}

/**
 * Opens Google Code Scanner on Android (no CAMERA permission needed for scan()).
 * Returns the raw QR string or null if cancelled.
 */
export async function scanReceiptQr() {
  if (!canUseNativeQrScan()) {
    throw new Error(
      "Камерата за QR работи в Android приложението. Тук ползвай ръчно поставяне на кода.",
    );
  }

  const { supported } = await BarcodeScanner.isSupported();
  if (!supported) {
    throw new Error("Сканирането на QR не се поддържа на това устройство.");
  }

  const { available } =
    await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
  if (!available) {
    await BarcodeScanner.installGoogleBarcodeScannerModule();
  }

  const { barcodes } = await BarcodeScanner.scan({
    formats: [BarcodeFormat.QrCode],
  });

  const value = barcodes?.[0]?.rawValue;
  if (!value) {
    return null;
  }
  return value;
}
