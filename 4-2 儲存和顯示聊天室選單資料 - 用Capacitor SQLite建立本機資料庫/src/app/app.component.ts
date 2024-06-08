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
    private sqlitedbService: SqlitedbService
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
  }
}
