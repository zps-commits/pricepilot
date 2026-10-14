/** Hands the browser a file to save. Returns false if the browser refused. */
export function downloadTextFile(filename: string, text: string, mime: string): boolean {
  try {
    // A BOM so Excel opens UTF-8 accented names correctly instead of mojibake.
    const blob = new Blob(['﻿', text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    // Revoked on the next tick: revoking synchronously can cancel the save
    // before the browser has read the blob.
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return true;
  } catch {
    return false;
  }
}
