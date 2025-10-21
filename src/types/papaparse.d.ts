declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: any;
  }
  
  export function parse<T>(input: string, config?: any): ParseResult<T>;
  export function unparse(data: any[], config?: any): string;
  export const Papa: {
    parse: typeof parse;
    unparse: typeof unparse;
  };
  
  export default Papa;
}
