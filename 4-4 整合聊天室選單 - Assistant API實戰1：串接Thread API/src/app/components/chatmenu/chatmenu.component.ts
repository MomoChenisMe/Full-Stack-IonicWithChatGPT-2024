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
import { OpenaiApiService } from 'src/app/services/openai-api.service';

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
  public async onChatRoomSelectAsync(chatRoomId: string) {
    await this.sqlitedbService.selectChatRoom(chatRoomId);
    await this.menuCtrl.close();
  }

  // 建立聊天室
  public async onChatRoomCreateAsync() {
    // 與OpenAI API建立一個新的Thread物件
    const newThreadObject = await this.openaiApiService.createThreadAsync();
    await this.sqlitedbService.createChatRoomAsync(newThreadObject.id);
    await this.menuCtrl.close();
  }

  // 刪除聊天室
  public async onChatRoomDeleteAsync(chatRoomId: string) {
    await this.alertService.deleteConfirmAsync({
      message: '確定要刪除聊天室?',
      confirmHandler: async (data) => {
        // 與OpenAI API刪除指定的Thread物件
        await this.openaiApiService.deleteThreadAsync(chatRoomId);
        await this.sqlitedbService.deleteChatRoomAsync(chatRoomId);
      },
    });
  }
}
