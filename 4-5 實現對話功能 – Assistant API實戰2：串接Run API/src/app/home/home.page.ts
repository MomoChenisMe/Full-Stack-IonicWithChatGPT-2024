import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonList,
} from '@ionic/angular/standalone';
import { Robot3dComponent } from '../components/robot3d/robot3d.component';
import { VoicerecordingComponent } from '../components/voicerecording/voicerecording.component';
import { ChatmenuComponent } from '../components/chatmenu/chatmenu.component';
import { ChatmenubuttonComponent } from '../components/chatmenubutton/chatmenubutton.component';
import { AudioRecording } from '@mozartec/capacitor-microphone';
import { OpenaiApiService } from '../services/openai-api.service';
import { SqlitedbService } from '../services/sqlitedb.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    Robot3dComponent,
    VoicerecordingComponent,
    ChatmenubuttonComponent,
    ChatmenuComponent,
  ],
})
export class HomePage {
  constructor(
    private openaiApiService: OpenaiApiService,
    private sqlitedbService: SqlitedbService
  ) {}

  onVoiceRecordFinished(audioRecording: AudioRecording) {
    // 執行完整對話
    this.openaiApiService
      .doEnglishConversation(
        {
          base64String: audioRecording.base64String ?? '',
          mimeType: audioRecording.mimeType ?? 'audio/aac',
          format: audioRecording.format ?? '.m4a',
        },
        this.sqlitedbService.selectChatRoomId() ?? ''
      )
      .subscribe((response) => {
        alert(response);
      });
  }
}
