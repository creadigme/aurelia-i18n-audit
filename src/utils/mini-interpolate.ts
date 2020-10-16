export class MiniInterpolate {
  private constructor() {
    // Private
  }

  /** Light interpolation */
  public static interpolate(text: string, data: any): string {
    return (
      text?.replace(/\{\{\s*([a-z]{1,})\s*\}\}/gi, (m, v) => {
        return data[v];
      }) || ''
    );
  }
}
