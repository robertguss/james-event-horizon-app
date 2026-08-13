export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  void navigator.serviceWorker.register("/sw.js").catch(() => {
    // Installability still works via manifest; SW is best-effort.
  });
}
