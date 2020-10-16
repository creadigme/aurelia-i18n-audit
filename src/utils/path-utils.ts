export class PathUtils {
  private constructor() {
    // Private
  }

  /** Ensure forward slash */
  public static forwardSlash(filePath: string): string {
    return filePath.replace(/\\/g, '/');
  }
}
