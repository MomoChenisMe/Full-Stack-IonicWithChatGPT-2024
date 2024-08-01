import { AzureTtsService } from './../services/azure-tts.service';
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
import { StatusService } from '../services/status.service';

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
    private sqlitedbService: SqlitedbService,
    private azureTtsService: AzureTtsService,
    private statusService: StatusService
  ) {}

  public onVoiceRecordFinished(audioRecording: AudioRecording) {
    const microphoneRecordData: MicrophoneRecordDataModel = {
      base64String: audioRecording.base64String ?? '',
      mimeType: audioRecording.mimeType ?? 'audio/aac',
      format: audioRecording.format ?? '.m4a',
    };
    const threadId = this.sqlitedbService.selectChatRoomId() ?? '';

    this.openaiApiService
      .createAudioTranscription(microphoneRecordData)
      .pipe(
        switchMap((audioTranscriptionObject) =>
          this.openaiApiService.createThreadMessage(
            audioTranscriptionObject.text,
            threadId
          )
        ),
        switchMap(() => this.openaiApiService.createThreadRun(threadId)),
        switchMap((runObject) =>
          this.openaiApiService.getRunAndPolling(threadId, runObject.id)
        ),
        switchMap((runObject) =>
          this.openaiApiService.getThreadMessage(threadId, runObject.id)
        ),
        switchMap((aiConversationResponseObject) =>
          this.azureTtsService.textToSpeech(
            aiConversationResponseObject.conversation,
            aiConversationResponseObject.style,
            aiConversationResponseObject.styleDegress
          )
        )
      )
      .subscribe((response) => {
        this.playAudio(response);
      });
  }

  private playAudio(audioBlob: Blob) {
    this.statusService.startPlayingAudio();
    let url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    audio.load();
    audio.onended = () => {
      this.statusService.stopPlayingAudio();
    };
    audio.play();
  }
}
