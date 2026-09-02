const DEFAULT_MESSAGE = "Hi Rubi, I would like to book bridal makeup.";

export function digitsOnly(value: string) {
  return value.replace(/[^0-9]/g, "");
}

export function resolveWhatsAppNumber(settingsNumber?: string | null) {
  return digitsOnly(
    settingsNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  );
}

export function getWhatsAppUrl(number: string, message = DEFAULT_MESSAGE) {
  return `https://wa.me/${digitsOnly(number)}?text=${encodeURIComponent(message)}`;
}
