/** Light interpolation */
export function interpolate(text: string, data: any): string {
  return (
    text?.replace(/{{([\$\w_\.\-]{1,})}}/gi, (m, v) => {
      return data[v];
    }) || ''
  );
}
