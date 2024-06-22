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
  public chatRoomList = this.sqlitedbService.chatRoomListReadOnly;

  constructor(
    private sqlitedbService: SqlitedbService,
    private menuCtrl: MenuController,
    private alertService: AlertService
  ) {
    addIcons({ addCircleOutline, trashOutline, chatbubblesOutline });
  }

  // 選擇聊天室
  public async onChatRoomSelectAsync(chatRoomId: string) {
    await this.sqlitedbService.selectChatRoom(chatRoomId);
    await this.menuCtrl.close();
  }

  // 建立聊天室
  public async onChatRoomCreateAsync() {
    await this.sqlitedbService.createChatRoom();
    await this.menuCtrl.close();
  }

  // 刪除聊天室
  public async onChatRoomDeleteAsync(chatRoomId: string) {
    await this.alertService.deleteConfirmAsync({
      message: '確定要刪除聊天室?',
      confirmHandler: (data) => {
        console.log(data);
        this.sqlitedbService.deleteChatRoom(chatRoomId);
      },
    });
  }
}
