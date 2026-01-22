export function logInfo(msg, ...rest) {
  console.log(`[INFO] ${msg}`, ...rest);
}
export function logError(msg, err) {
  console.error(`[ERROR] ${msg}:`, err?.message ?? err);
}
