import axios from "axios";

/** The `message` field from an API error response body, if there is one. */
export const getApiMessage = (err: unknown): string | undefined => {
  if (!axios.isAxiosError(err)) return undefined;
  const data = err.response?.data as { message?: string } | undefined;
  return data?.message;
};

/**
 * Pull a human-readable message out of an unknown thrown value.
 * Prefers the API's `{ message }` body, then the error's own message.
 */
export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return getApiMessage(err) || err.message || fallback;
  }
  if (err instanceof Error) {
    return err.message || fallback;
  }
  return fallback;
};
