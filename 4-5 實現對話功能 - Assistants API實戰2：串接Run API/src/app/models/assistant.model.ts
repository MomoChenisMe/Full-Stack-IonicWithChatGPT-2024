// 共用的基礎模型
export interface BaseObjectModel {
  id: string;
  object: string;
  created_at: number;
  metadata: any;
}

// Thread物件模型
export interface ThreadObjectModel extends BaseObjectModel {
  tool_resources: any;
}

// 刪除回應模型
export interface DeleteThreadResponseModel {
  id: string;
  object: string;
  deleted: true;
}

// 對話內容模型
export interface ContentModel {
  type: string;
  text: {
    value: string;
    annotations: any[];
  };
}

// Message物件模型
export interface MessageObjectModel extends BaseObjectModel {
  thread_id: string;
  role: string;
  content: ContentModel[];
  assistant_id: string | null;
  run_id: string | null;
  attachments: any[] | null;
}

// Run物件狀態類型
export type RunStatusType =
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelling'
  | 'cancelled'
  | 'incomplete'
  | 'expired'
  | 'requires_action';

// Run物件模型
export interface RunObjectModel extends BaseObjectModel {
  assistant_id: string;
  thread_id: string;
  status: RunStatusType;
  started_at: number;
  expires_at: number | null;
  cancelled_at: number | null;
  failed_at: number | null;
  completed_at: number | null;
  last_error: any | null;
  model: string;
  instructions: any | null;
  tools: Array<{ type: string }>;
  incomplete_details: any | null;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  temperature: number;
  top_p: number;
  max_prompt_tokens: number;
  max_completion_tokens: number;
  truncation_strategy: {
    type: string;
    last_messages: any | null;
  };
  response_format: string;
  tool_choice: string;
  parallel_tool_calls: boolean;
}

// 列表物件模型
export interface ListofObjectModel<T> {
  object: string;
  data: T[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}
