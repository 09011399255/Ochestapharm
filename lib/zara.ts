export function startZaraOrder(product?: { id?: string; name?: string } | string) {
  if (typeof window !== "undefined") {
    const zw = (window as any).ZaraWidget;
    if (zw) {
      if (product) {
        return zw.openWithProduct(product);
      }
      return zw.open();
    }
    // Fallback only if the widget script failed to load:
    window.location.href = "/order";
  }
}
