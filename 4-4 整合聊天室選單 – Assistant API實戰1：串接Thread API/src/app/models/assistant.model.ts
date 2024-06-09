export interface CreateThreadResponseModel {
  id: string;
  object: string;
  created_at: number;
  metadata: {};
  tool_resources: {};
}

export interface DeleteThreadResponseModel {
  id: string;
  object: string;
  deleted: true;
}
