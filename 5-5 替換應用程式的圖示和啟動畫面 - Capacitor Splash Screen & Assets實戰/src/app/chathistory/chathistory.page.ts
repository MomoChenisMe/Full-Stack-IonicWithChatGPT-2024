import { SqlitedbService } from './../services/sqlitedb.service';
import { Component, effect, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-chathistory',
  templateUrl: './chathistory.page.html',
  styleUrls: ['./chathistory.page.scss'],
  standalone: true,
  imports: [
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    IonBackButton,
    IonIcon,
  ],
})
export class ChathistoryPage {
  chatHistoryListReadOnly = this.sqlitedbService.chatHistoryListReadOnly;
  ionContent = viewChild<IonContent>('ionContent');
  hasMoreData = signal<boolean>(true);
  private beforeScrollPosition = 0;

  constructor(private sqlitedbService: SqlitedbService) {
    addIcons({ alertCircleOutline });
    effect(
      async () => {
        if (this.ionContent()) {
          this.sqlitedbService.defaultChatHistoryData();
          const moreData =
            await this.sqlitedbService.loadChatHistoryDataAsync();
          this.hasMoreData.set(moreData);
          setTimeout(() => {
            this.ionContent()?.scrollToBottom();
          }, 50);
        }
      },
      { allowSignalWrites: true }
    );
  }

  public async onIonInfinite(e: InfiniteScrollCustomEvent) {
    const beforeScrollElement = await this.ionContent()?.getScrollElement();
    this.beforeScrollPosition = beforeScrollElement!.scrollHeight;
    const moreData = await this.sqlitedbService.loadChatHistoryDataAsync();
    this.hasMoreData.set(moreData);
    await e.target.complete();

    setTimeout(async () => {
      const afterScrollElement = await this.ionContent()?.getScrollElement();
      await this.ionContent()?.scrollToPoint(
        0,
        afterScrollElement!.scrollHeight - this.beforeScrollPosition,
        0
      );
    }, 50);
  }
}
