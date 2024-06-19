import { OpenaiApiService } from './services/openai-api.service';
import { Component, OnDestroy } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { SqlitedbService } from './services/sqlitedb.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnDestroy {
  private pauseSubscription: Subscription = this.platform.pause.subscribe(
    () => {
      this.sqlitedbService.closeSQLiteDB();
    }
  );

  private resumeSubscription: Subscription = this.platform.resume.subscribe(
    () => {
      this.sqlitedbService.openSQLiteDB();
    }
  );

  constructor(
    private platform: Platform,
    private sqlitedbService: SqlitedbService,
    private openaiApiService: OpenaiApiService
  ) {
    // 初始化設定
    this.initAppSettingAndPlugin();
  }

  ngOnDestroy(): void {
    this.sqlitedbService.closeSQLiteDB();
    this.pauseSubscription.unsubscribe();
    this.resumeSubscription.unsubscribe();
  }

  private async initAppSettingAndPlugin() {
    // SQLite初始化
    await this.sqlitedbService.openSQLiteDBAndDoInitialize();
    // 檢查是否有初始資料
    const hasLeastOneChatRoom =
      await this.sqlitedbService.ensureAtLeastOneChatRoom();
    if (hasLeastOneChatRoom) {
      // 與OpenAI API建立一個新的Thread物件
      const newThreadObject = await this.openaiApiService.createThreadAsync();
      // 新增一個聊天室
      await this.sqlitedbService.createChatRoom(newThreadObject.id);
    } else {
      // 有資料就讀取聊天室資料
      await this.sqlitedbService.loadChatRoomData();
    }
  }
}
