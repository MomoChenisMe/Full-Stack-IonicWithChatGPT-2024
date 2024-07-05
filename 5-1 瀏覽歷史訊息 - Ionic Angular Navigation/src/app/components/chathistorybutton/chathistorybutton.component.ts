import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon, IonRippleEffect } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubblesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-chathistorybutton',
  imports: [CommonModule, IonIcon, IonRippleEffect],
  templateUrl: './chathistorybutton.component.html',
  styleUrls: ['./chathistorybutton.component.scss'],
  standalone: true,
})
export class ChathistorybuttonComponent {
  constructor(private router: Router) {
    addIcons({ chatbubblesOutline });
  }

  public onChatHistoryClick() {
    this.router.navigateByUrl('/chathistory');
  }
}
