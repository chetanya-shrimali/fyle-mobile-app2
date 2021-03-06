export interface ExtendedStatus {
  isSelfComment?: boolean;
  isBotComment?: boolean;
  st_advance_request_id?: string;
  st_comment: string;
  st_created_at: Date;
  st_diff?: any;
  st_id: string;
  st_org_user_id: string;
  st_report_id?: string;
  st_state?: string;
  st_transaction_id?: string;
  st_trip_request_id?: string;
  us_email?: string;
  us_full_name: string;
}
