export interface edustackAPIRequestType {
  method: string;
  data?: any;
  endpoint: string;
  token: string;
}

export interface edustackAPIResponseType {
  success: boolean;
  [key: string]: any;
}

export interface classSchoolRequest {
  label: string;
  section?: string[];
  school_id: string[];
}
