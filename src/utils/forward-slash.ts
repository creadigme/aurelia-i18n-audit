/** Ensure forward slash */
export function forwardSlash(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}
