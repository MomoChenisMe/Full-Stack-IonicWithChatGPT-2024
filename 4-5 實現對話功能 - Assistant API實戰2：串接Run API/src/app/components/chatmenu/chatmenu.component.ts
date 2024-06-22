import { OpenaiApiService } from './../../services/openai-api.service';
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
    private alertService: AlertService,
    private openaiApiService: OpenaiApiService
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
    // 與OpenAI API建立一個新的Thread物件
    const newThreadObject = await this.openaiApiService.createThreadAsync();
    this.sqlitedbService.createChatRoom(newThreadObject.id);
    this.menuCtrl.close();
  }

  // 刪除聊天室
  async onChatRoomDelete(chatRoomId: string) {
    await this.alertService.deleteConfirm({
      message: '確定要刪除聊天室?',
      confirmHandler: async (data) => {
        // 與OpenAI API刪除指定的Thread物件
        await this.openaiApiService.deleteThreadAsync(chatRoomId);
        await this.sqlitedbService.deleteChatRoom(chatRoomId);
      },
    });
  }
}
