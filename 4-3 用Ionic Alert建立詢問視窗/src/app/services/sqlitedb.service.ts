import { Injectable, signal } from '@angular/core';
import {
  SQLiteConnection,
  CapacitorSQLite,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { ChatRoomModel } from './sqlitedb.model';

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

@Injectable({
  providedIn: 'root',
})
export class SqlitedbService {
  //SQLite連線物件
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  //資料庫連線物件
  private db!: SQLiteDBConnection;
  //儲存聊天室選單的Signal
  private chatRoomList = signal<ChatRoomModel[]>([]);
  //Readonly的Signal
  public chatRoomListReadOnly = this.chatRoomList.asReadonly();

  public async openSQLiteDBAndDoInitialize() {
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
      //執行聊天室選單資料表的建立
      await this.db.execute(CHATROOM_SCHEMA);
      //確保至少存在一個聊天室
      await this.ensureAtLeastOneChatRoom();
      //讀取聊天室選單資料
      await this.loadChatRoomData();
    } catch (error) {
      console.error('Error initializing plugin:', error);
    }
  }

  private async ensureAtLeastOneChatRoom() {
    try {
      //查詢聊天室選單資料表中的數量
      const chatCount = await this.db.query(
        'SELECT COUNT(*) AS count FROM CHATROOM'
      );
      //若沒有任何資料，則建立一個初始的聊天室
      if (chatCount.values && chatCount.values[0].count === 0) {
        await this.createInitialChatRoom();
      }
    } catch (error) {
      console.error('Error ensuring at least one chat room:', error);
    }
  }

  private async createInitialChatRoom() {
    try {
      //建立初始的聊天室
      const query =
        'INSERT INTO CHATROOM (chatRoomId, name, isSelected) VALUES (?, ?, ?)';
      const values = [Date.now().toString(), '對話聊天室', 1];
      await this.db.run(query, values);
    } catch (error) {
      console.error('Error adding initial chat room:', error);
    }
  }

  private async loadChatRoomData() {
    try {
      //讀取所有聊天室選單資料
      const chatroomDbData = await this.db.query(
        'SELECT * FROM CHATROOM ORDER BY timestamp'
      );
      this.chatRoomList.set(chatroomDbData.values ?? []);
    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  }

  private async updateAllChatRoomDataToUnSelected() {
    try {
      //將所有聊天室的選擇狀態更新為未選擇
      await this.db.run('UPDATE CHATROOM SET isSelected = 0');
    } catch (error) {
      console.error('Error update all chat room to unselected:', error);
    }
  }

  public async openSQLiteDB() {
    try {
      if (this.db) {
        await this.db.open();
      }
    } catch (error) {
      console.error('Error opening database:', error);
    }
  }

  public async closeSQLiteDB() {
    try {
      if (this.db) {
        await this.db.close();
      }
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }

  public async createChatRoom() {
    try {
      //將所有聊天室的選擇狀態更新為未選擇
      await this.updateAllChatRoomDataToUnSelected();
      //新增一個新的聊天室並將其設置為已選擇
      const query =
        'INSERT INTO CHATROOM (chatRoomId, name, isSelected) VALUES (?, ?, ?)';
      const values = [Date.now().toString(), '對話聊天室', 1];
      await this.db.run(query, values);
      //重新讀取聊天室選單資料
      await this.loadChatRoomData();
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  }

  public async selectChatRoom(chatRoomId: string) {
    try {
      //將所有聊天室的選擇狀態更新為未選擇
      await this.updateAllChatRoomDataToUnSelected();
      //根據chatRoomId將特定聊天室的選擇狀態設置為已選擇
      await this.db.run(
        'UPDATE CHATROOM SET isSelected = 1 WHERE chatRoomId = ?',
        [chatRoomId]
      );
      //重新讀取聊天室選單資料
      await this.loadChatRoomData();
    } catch (error) {
      console.error('Error selecting chat room:', error);
    }
  }

  public async deleteChatRoom(chatRoomId: string) {
    try {
      //刪除聊天室
      const deleteChatRoomQuery = 'DELETE FROM CHATROOM WHERE chatRoomId = ?';
      await this.db.run(deleteChatRoomQuery, [chatRoomId]);
      //重新讀取聊天室選單資料
      await this.loadChatRoomData();
    } catch (error) {
      console.error(
        `Error deleting chat room with chatRoomId: ${chatRoomId}`,
        error
      );
    }
  }
}
