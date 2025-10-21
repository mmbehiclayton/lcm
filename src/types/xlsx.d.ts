declare module 'xlsx' {
  export interface WorkSheet {
    [key: string]: any;
  }
  
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheetName: string]: WorkSheet };
  }
  
  export function read(data: any, options?: any): WorkBook;
  export function readFile(filePath: string, options?: any): WorkBook;
  export function write(data: WorkBook, options?: any): any;
  export const utils: {
    sheet_to_json: (sheet: WorkSheet, options?: any) => any[];
    json_to_sheet: (data: any[], options?: any) => WorkSheet;
  };
  
  export default {
    read,
    readFile,
    write,
    utils
  };
}
