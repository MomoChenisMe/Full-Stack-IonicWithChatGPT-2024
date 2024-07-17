export interface ChatRequestModel {
  model: string;
  messages: ChatRequestMessageModel[];
  temperature?: number;
  top_p?: number;
  stream: boolean;
}

export interface ChatRequestMessageModel {
  role: string;
  content: string;
}

export interface ChatCompletionChunkModel {
  id: string;
  choices: ChatCompletionChunkChoiceModel[];
  created: number;
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionChunkChoiceModel {
  delta: {
    content: string;
  };
  finish_reason: string | null;
}
