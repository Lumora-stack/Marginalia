export type GameLinkValidation =
  | { ok: true; value: string | null }
  | { ok: false; error: string };

export function validateGameLink(input: string, required = false): GameLinkValidation {
  const trimmed = input.trim();
  if (!trimmed) {
    return required
      ? { ok: false, error: 'Enter a game link to publish this game.' }
      : { ok: true, value: null };
  }

  if (/^[a-z][a-z\d+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return { ok: false, error: 'Use a valid http or https URL.' };
  }

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(normalized);
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname) {
      return { ok: false, error: 'Use a valid http or https URL.' };
    }
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false, error: 'Enter a valid web address, such as https://example.com.' };
  }
}
