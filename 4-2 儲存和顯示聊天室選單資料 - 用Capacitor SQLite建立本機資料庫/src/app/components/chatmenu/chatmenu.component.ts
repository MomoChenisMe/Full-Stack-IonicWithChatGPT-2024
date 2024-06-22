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
  public chatRoomList = this.sqlitedbService.chatRoomListReadOnly;

  constructor(
    private sqlitedbService: SqlitedbService,
    private menuCtrl: MenuController
  ) {
    addIcons({ addCircleOutline, trashOutline, chatbubblesOutline });
  }

  // 選擇聊天室
  public async onChatRoomSelectAsync(chatRoomId: string) {
    await this.sqlitedbService.selectChatRoomAsync(chatRoomId);
    await this.menuCtrl.close();
  }

  // 建立聊天室
  public async onChatRoomCreateAsync() {
    await this.sqlitedbService.createChatRoomAsync();
    await this.menuCtrl.close();
  }

  // 刪除聊天室
  public async onChatRoomDeleteAsync(chatRoomId: string) {
    await this.sqlitedbService.deleteChatRoomAsync(chatRoomId);
  }
}
