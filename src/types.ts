export interface Rule {
  fixCode: any;
  id: string;
  pattern: string;
  fix: string;
  reason: string;
  link?: string;
}
