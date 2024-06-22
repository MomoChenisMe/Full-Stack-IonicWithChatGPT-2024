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
import { switchMap } from 'rxjs';
import { MicrophoneRecordDataModel } from '../models/audio.model';

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

  public onVoiceRecordFinished(audioRecording: AudioRecording) {
    const microphoneRecordData: MicrophoneRecordDataModel = {
      base64String: audioRecording.base64String ?? '',
      mimeType: audioRecording.mimeType ?? 'audio/aac',
      format: audioRecording.format ?? '.m4a',
    };
    const threadId = this.sqlitedbService.selectChatRoomId() ?? '';

    // 執行完整對話
    this.openaiApiService
      .createAudioTranscription(microphoneRecordData)
      .pipe(
        switchMap((transcriptionObject) =>
          this.openaiApiService.createThreadMessage(
            transcriptionObject.text,
            threadId
          )
        ),
        switchMap(() => this.openaiApiService.createThreadRun(threadId)),
        switchMap((runObject) =>
          this.openaiApiService.getRunAndPolling(threadId, runObject.id)
        ),
        switchMap((runObject) =>
          this.openaiApiService.getThreadMessage(threadId, runObject.id)
        )
      )
      .subscribe((response) => {
        alert(response);
      });
  }
}
