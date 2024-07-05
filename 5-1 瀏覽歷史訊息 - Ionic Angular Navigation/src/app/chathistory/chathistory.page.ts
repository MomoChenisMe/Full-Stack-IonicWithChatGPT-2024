import { SqlitedbService } from './../services/sqlitedb.service';
import { Component, OnInit, effect, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonIcon,
  IonInfiniteScrollContent,
  IonInfiniteScroll,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-chathistory',
  templateUrl: './chathistory.page.html',
  styleUrls: ['./chathistory.page.scss'],
  standalone: true,
  imports: [
    IonInfiniteScroll,
    IonInfiniteScrollContent,
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

  constructor(private sqlitedbService: SqlitedbService) {
    addIcons({ alertCircleOutline });
    effect(() => {
      if (this.ionContent()) {
        this.ionContent()?.scrollToBottom();
      }
    });
  }
}
