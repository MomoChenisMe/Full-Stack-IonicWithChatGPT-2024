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
import { HttpClient } from '@angular/common/http';
import { AudioRecording } from '@mozartec/capacitor-microphone';
import { OpenaiApiService } from '../services/openai-api.service';

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
  constructor(private openaiApiService: OpenaiApiService) {}

  onVoiceRecordFinished(audioRecording: AudioRecording) {
    // 串接Audio API
    this.openaiApiService
      .createAudioTranscription({
        base64String: audioRecording.base64String ?? '',
        mimeType: audioRecording.mimeType ?? 'audio/aac',
        format: audioRecording.format ?? '.m4a',
      })
      .subscribe((response) => {
        alert(response.text);
      });
  }
}
