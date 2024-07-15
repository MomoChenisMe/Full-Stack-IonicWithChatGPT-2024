export interface ChatRoomModel {
  chatRoomId: string;
  name: string;
  isSelected: boolean;
  timestamp: Date;
}

export interface ChatHistoryModel {
  chatHistoryId: number;
  chatRoomId: string;
  role: string;
  content: string;
  grammar: boolean;
  colloquial: boolean;
  timestamp: Date;
}

export interface AILastGrammerAndColloquialModel {
  grammar: boolean;
  colloquial: boolean;
}
