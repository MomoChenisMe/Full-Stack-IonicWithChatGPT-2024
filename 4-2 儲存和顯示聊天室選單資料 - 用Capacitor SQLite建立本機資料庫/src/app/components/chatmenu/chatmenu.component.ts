import { SqlitedbService } from './../../services/sqlitedb.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonIcon,
  IonRippleEffect,
  IonMenu,
  IonHeader,
  IonContent,
  IonToolbar,
  IonList,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  trashOutline,
  chatbubblesOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-chatmenu',
  imports: [
    IonList,
    IonToolbar,
    IonHeader,
    CommonModule,
    IonIcon,
    IonRippleEffect,
    IonHeader,
    IonToolbar,
    IonContent,
    IonMenu,
  ],
  templateUrl: './chatmenu.component.html',
  styleUrls: ['./chatmenu.component.scss'],
  standalone: true,
})
export class ChatmenuComponent {
  chatRoomList = this.sqlitedbService.chatRoomListReadOnly;

  constructor(
    private sqlitedbService: SqlitedbService,
    private menuCtrl: MenuController
  ) {
    addIcons({ addCircleOutline, trashOutline, chatbubblesOutline });
  }

  onChatRoomSelect(chatroomId: string) {
    this.sqlitedbService.selectChatRoom(chatroomId);
    this.menuCtrl.close();
  }

  async onChatRoomCreate() {
    this.sqlitedbService.createChatRoom();
    this.menuCtrl.close();
  }

  async onChatRoomDelete(chatroomId: string) {
    await this.sqlitedbService.deleteChatRoom(chatroomId);
  }
}
