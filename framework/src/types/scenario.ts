export interface Scenario {
  name: string;              // useful for reporting/logging
  [key: string]: any;        // allow arbitrary test data fields
  tags?: string[];           // optional grouping/filtering
}
