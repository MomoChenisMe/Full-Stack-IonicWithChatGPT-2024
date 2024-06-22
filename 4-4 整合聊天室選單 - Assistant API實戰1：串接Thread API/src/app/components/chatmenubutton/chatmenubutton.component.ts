import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonIcon,
  IonRippleEffect,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menuOutline } from 'ionicons/icons';

@Component({
  selector: 'app-chatmenubutton',
  imports: [CommonModule, IonIcon, IonRippleEffect],
  templateUrl: './chatmenubutton.component.html',
  styleUrls: ['./chatmenubutton.component.scss'],
  standalone: true,
})
export class ChatmenubuttonComponent {
  constructor(private menuCtrl: MenuController) {
    addIcons({ menuOutline });
  }

  // 開啟聊天室選單
  onOpenCloseMenuClick() {
    this.menuCtrl.open('chat-menu');
  }
}
