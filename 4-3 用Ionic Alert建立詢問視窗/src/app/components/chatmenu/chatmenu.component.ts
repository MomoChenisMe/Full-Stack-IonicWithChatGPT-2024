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
  IonAlert,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  trashOutline,
  chatbubblesOutline,
} from 'ionicons/icons';
import { AlertService } from 'src/app/services/alert.service';

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
    IonAlert,
  ],
  templateUrl: './chatmenu.component.html',
  styleUrls: ['./chatmenu.component.scss'],
  standalone: true,
})
export class ChatmenuComponent {
  chatRoomList = this.sqlitedbService.chatRoomListReadOnly;

  constructor(
    private sqlitedbService: SqlitedbService,
    private menuCtrl: MenuController,
    private alertService: AlertService
  ) {
    addIcons({ addCircleOutline, trashOutline, chatbubblesOutline });
  }

  // 選擇聊天室
  onChatRoomSelect(chatRoomId: string) {
    this.sqlitedbService.selectChatRoom(chatRoomId);
    this.menuCtrl.close();
  }

  // 建立聊天室
  async onChatRoomCreate() {
    this.sqlitedbService.createChatRoom();
    this.menuCtrl.close();
  }

  // 刪除聊天室
  async onChatRoomDelete(chatRoomId: string) {
    await this.alertService.deleteConfirm({
      message: '確定要刪除聊天室?',
      confirmHandler: (data) => {
        console.log(data);
        this.sqlitedbService.deleteChatRoom(chatRoomId);
      },
    });
  }
}
