import { Component, OnDestroy } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { SqlitedbService } from './services/sqlitedb.service';
import { Subscription } from 'rxjs';
import { OpenaiApiService } from './services/openai-api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnDestroy {
  private pauseSubscription: Subscription = this.platform.pause.subscribe(
    () => {
      this.sqlitedbService.closeSQLiteDBAsync();
    }
  );

  private resumeSubscription: Subscription = this.platform.resume.subscribe(
    () => {
      this.sqlitedbService.openSQLiteDBAsync();
    }
  );

  constructor(
    private platform: Platform,
    private sqlitedbService: SqlitedbService,
    private openaiApiService: OpenaiApiService
  ) {
    // 初始化設定
    this.initAppSettingAndPluginAsync();
  }

  ngOnDestroy(): void {
    this.sqlitedbService.closeSQLiteDBAsync();
    this.pauseSubscription.unsubscribe();
    this.resumeSubscription.unsubscribe();
  }

  private async initAppSettingAndPluginAsync() {
    // SQLite初始化
    await this.sqlitedbService.openSQLiteDBAndDoInitializeAsync();
    // 檢查是否有初始資料
    const hasLeastOneChatRoom =
      await this.sqlitedbService.ensureAtLeastOneChatRoomAsync();
    if (hasLeastOneChatRoom) {
      // 與OpenAI API建立一個新的Thread物件
      const newThreadObject = await this.openaiApiService.createThreadAsync();
      // 新增一個聊天室
      await this.sqlitedbService.createChatRoomAsync(newThreadObject.id);
    } else {
      // 有資料就讀取聊天室資料
      await this.sqlitedbService.loadChatRoomDataAsync();
    }
  }
}
