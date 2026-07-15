export function closeAllOpenDialogs(): void {
  document.querySelectorAll("dialog[open]").forEach((element) => {
    if (element instanceof HTMLDialogElement) {
      element.close();
    }
  });
}
