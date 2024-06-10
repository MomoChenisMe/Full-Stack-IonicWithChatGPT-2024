export interface ThreadObjectModel {
  id: string;
  object: string;
  created_at: number;
  metadata: any;
  tool_resources: any;
}

export interface DeleteThreadResponseModel {
  id: string;
  object: string;
  deleted: true;
}
