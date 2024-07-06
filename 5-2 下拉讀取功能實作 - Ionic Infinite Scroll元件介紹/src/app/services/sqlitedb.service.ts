import { Injectable, computed, signal } from '@angular/core';
import {
  SQLiteConnection,
  CapacitorSQLite,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { ChatHistoryModel, ChatRoomModel } from '../models/sqlitedb.model';
import { Observable, from } from 'rxjs';

// 定義資料庫名稱
const DB_NAME = 'aiconversation';

// 定義聊天室選單的資料結構
const CHATROOM_SCHEMA = `
CREATE TABLE IF NOT EXISTS CHATROOM (
  chatRoomId TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  isSelected INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// 定義歷史訊息的資料結構
const CHATHISTORY_SCHEMA = `
CREATE TABLE IF NOT EXISTS CHATHISTORY (
  chatHistoryId INTEGER PRIMARY KEY AUTOINCREMENT,
  chatRoomId TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  grammar INTEGER DEFAULT 0,
  colloquial INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(chatRoomId) REFERENCES CHATROOM(chatRoomId)
);
`;

@Injectable({
  providedIn: 'root',
})
export class SqlitedbService {
  // SQLite連線物件
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  // 資料庫連線物件
  private db!: SQLiteDBConnection;
  // 儲存聊天室選單的Signal
  private chatRoomList = signal<ChatRoomModel[]>([]);
  // Readonly的Signal
  public chatRoomListReadOnly = this.chatRoomList.asReadonly();
  // 取得選中的聊天室ID
  public selectChatRoomId = computed(() => {
    return this.chatRoomList().find((chatRoom) => chatRoom.isSelected)
      ?.chatRoomId;
  });
  // 儲存歷史訊息的Signal
  private chatHistoryList = signal<ChatHistoryModel[]>([]);
  // Readonly的Signal
  public chatHistoryListReadOnly = this.chatHistoryList.asReadonly();
  // 當前頁面
  private currentPage = 0;
  // 每頁顯示的資料筆數
  private pageSize = 20;

  public async openSQLiteDBAndDoInitializeAsync() {
    try {
      //建立並開啟資料庫連接
      this.db = await this.sqlite.createConnection(
        DB_NAME,
        false,
        'no-encryption',
        1,
        false
      );
      await this.db.open();
      // 執行聊天室選單資料表的建立
      await this.db.execute(CHATROOM_SCHEMA);
      // 執行歷史訊息內容資料表的建立
      await this.db.execute(CHATHISTORY_SCHEMA);
    } catch (error) {
      console.error('Error initializing plugin:', error);
    }
  }

  public async ensureAtLeastOneChatRoomAsync() {
    try {
      // 查詢聊天室選單資料表中的數量
      const chatCount = await this.db.query(
        'SELECT COUNT(*) AS count FROM CHATROOM'
      );
      return chatCount.values && chatCount.values[0].count === 0;
    } catch (error) {
      console.error('Error ensuring at least one chat room:', error);
      return false;
    }
  }

  public async loadChatRoomDataAsync() {
    try {
      // 讀取所有聊天室選單資料
      const chatRoomDbData = await this.db.query(
        'SELECT * FROM CHATROOM ORDER BY timestamp'
      );
      this.chatRoomList.set(chatRoomDbData.values ?? []);
      // 不再重新讀取歷史訊息資料
      // await this.loadChatHistoryDataAsync();
      this.defaultChatHistoryData();
    } catch (error) {
      console.error('Error loading chat room data:', error);
    }
  }

  // private async loadChatHistoryDataAsync() {
  //   try {
  //     //只讀取當前選中的聊天室的歷史訊息資料
  //     const chatHistoryDbData = await this.db.query(
  //       'SELECT CHATHISTORY.* FROM CHATHISTORY JOIN CHATROOM ON CHATHISTORY.chatRoomId = CHATROOM.chatRoomId WHERE CHATROOM.isSelected = 1 ORDER BY CHATHISTORY.timestamp'
  //     );
  //     this.chatHistoryList.set(chatHistoryDbData.values ?? []);
  //   } catch (error) {
  //     console.error('Error loading chat history data:', error);
  //   }
  // }

  public defaultChatHistoryData() {
    this.chatHistoryList.set([]);
    this.currentPage = 0;
    this.pageSize = 10;
  }

  public async loadChatHistoryDataAsync() {
    try {
      //只讀取當前選中的聊天室的歷史訊息資料
      const offset = this.currentPage * this.pageSize;
      // 查詢當前頁面的歷史訊息
      const chatHistoryDbData = await this.db.query(
        'SELECT CHATHISTORY.* FROM CHATHISTORY JOIN CHATROOM ON CHATHISTORY.chatRoomId = CHATROOM.chatRoomId WHERE CHATROOM.isSelected = 1 ORDER BY CHATHISTORY.timestamp DESC LIMIT ? OFFSET ?',
        [this.pageSize, offset]
      );
      const newRecords = chatHistoryDbData.values ?? [];
      // 將新的歷史訊息加入到原有的歷史訊息列表中
      this.chatHistoryList.update((oldList) => {
        return [...newRecords.reverse(), ...oldList];
      });
      // 查詢總記錄數
      const totalRecordsData = await this.db.query(
        'SELECT COUNT(*) as total FROM CHATHISTORY JOIN CHATROOM ON CHATHISTORY.chatRoomId = CHATROOM.chatRoomId WHERE CHATROOM.isSelected = 1'
      );
      const totalRecords = totalRecordsData.values
        ? totalRecordsData.values[0].total
        : 0;
      const totalPages = Math.ceil(totalRecords / this.pageSize);
      // 檢查是否已經到達最後一頁
      if (this.currentPage >= totalPages - 1) {
        return true;
      } else {
        this.currentPage++;
        return false;
      }
    } catch (error) {
      console.error('Error loading chat history data:', error);
      return true;
    }
  }

  private async updateAllChatRoomDataToUnSelectedAsync() {
    try {
      // 將所有聊天室的選擇狀態更新為未選擇
      await this.db.run('UPDATE CHATROOM SET isSelected = 0');
    } catch (error) {
      console.error('Error update all chat room to unselected:', error);
    }
  }

  public async openSQLiteDBAsync() {
    try {
      if (this.db) {
        await this.db.open();
      }
    } catch (error) {
      console.error('Error opening database:', error);
    }
  }

  public async closeSQLiteDBAsync() {
    try {
      if (this.db) {
        await this.db.close();
      }
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }

  public async createChatRoomAsync(newChatRoomId: string) {
    try {
      // 將所有聊天室的選擇狀態更新為未選擇
      await this.updateAllChatRoomDataToUnSelectedAsync();
      // 新增一個新的聊天室並將其設定為已選擇
      const query =
        'INSERT INTO CHATROOM (chatRoomId, name, isSelected) VALUES (?, ?, ?)';
      const values = [newChatRoomId, '對話聊天室', 1];
      await this.db.run(query, values);
      // 重新讀取聊天室選單資料
      await this.loadChatRoomDataAsync();
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  }

  public async selectChatRoomAsync(chatRoomId: string) {
    try {
      // 將所有聊天室的選擇狀態更新為未選擇
      await this.updateAllChatRoomDataToUnSelectedAsync();
      // 根據chatRoomId將特定聊天室的選擇狀態設定為已選擇
      await this.db.run(
        'UPDATE CHATROOM SET isSelected = 1 WHERE chatRoomId = ?',
        [chatRoomId]
      );
      // 重新讀取聊天室選單資料
      await this.loadChatRoomDataAsync();
    } catch (error) {
      console.error('Error selecting chat room:', error);
    }
  }

  public async deleteChatRoomAsync(chatRoomId: string) {
    try {
      // 刪除聊天室的歷史訊息
      const deleteChatHistoryQuery =
        'DELETE FROM CHATHISTORY WHERE chatRoomId = ?';
      await this.db.run(deleteChatHistoryQuery, [chatRoomId]);
      // 刪除聊天室
      const deleteChatRoomQuery = 'DELETE FROM CHATROOM WHERE chatRoomId = ?';
      await this.db.run(deleteChatRoomQuery, [chatRoomId]);

      // 重新讀取聊天室選單資料
      await this.loadChatRoomDataAsync();
    } catch (error) {
      console.error(
        `Error deleting chat room with chatRoomId: ${chatRoomId}`,
        error
      );
    }
  }

  public async addUserChatHistoryAsync(userContent: string) {
    try {
      // 新增使用者的歷史訊息
      const query =
        'INSERT INTO CHATHISTORY (chatRoomId, role, content, grammar, colloquial) VALUES (?, ?, ?, ?, ?)';
      const values = [this.selectChatRoomId(), 'user', userContent, 0, 0];
      await this.db.run(query, values);
      // 新增時不再重新讀取歷史訊息資料
      // await this.loadChatHistoryDataAsync();
    } catch (error) {
      console.error(
        `Error adding chat history with chatRoomId: ${this.selectChatRoomId()}:`,
        error
      );
    }
  }

  public addUserChatHistory(userContent: string): Observable<void> {
    return from(this.addUserChatHistoryAsync(userContent));
  }

  public async addAssistantChatHistoryAsync(
    assistantContent: string,
    grammer: boolean,
    colloquial: boolean
  ) {
    try {
      // 新增AI英語口說導師的歷史訊息
      const query =
        'INSERT INTO CHATHISTORY (chatRoomId, role, content, grammar, colloquial) VALUES (?, ?, ?, ?, ?)';
      const values = [
        this.selectChatRoomId(),
        'assistant',
        assistantContent,
        grammer ? 1 : 0,
        colloquial ? 1 : 0,
      ];
      await this.db.run(query, values);
      // 新增時不再重新讀取歷史訊息資料
      // await this.loadChatHistoryDataAsync();
    } catch (error) {
      console.error(
        `Error adding chat history with chatRoomId: ${this.selectChatRoomId()}:`,
        error
      );
    }
  }

  public addAssistantChatHistory(
    assistantContent: string,
    grammer: boolean,
    colloquial: boolean
  ): Observable<void> {
    return from(
      this.addAssistantChatHistoryAsync(assistantContent, grammer, colloquial)
    );
  }
}
