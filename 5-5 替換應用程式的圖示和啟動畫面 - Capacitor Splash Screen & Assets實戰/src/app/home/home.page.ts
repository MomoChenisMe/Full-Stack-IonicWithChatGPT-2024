import { AzureTtsService } from './../services/azure-tts.service';
import { AfterViewInit, Component } from '@angular/core';
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
import { map, switchMap } from 'rxjs';
import { MicrophoneRecordDataModel } from '../models/audio.model';
import { ReplayaudioComponent } from '../components/replayaudio/replayaudio.component';
import { StatusService } from '../services/status.service';
import { ChathistorybuttonComponent } from '../components/chathistorybutton/chathistorybutton.component';
import { LightbulbbuttonComponent } from '../components/lightbulbbutton/lightbulbbutton.component';
import { SplashScreen } from '@capacitor/splash-screen';

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
    ReplayaudioComponent,
    ChathistorybuttonComponent,
    LightbulbbuttonComponent,
  ],
})
export class HomePage implements AfterViewInit {
  audioFile: Blob | null = null;

  constructor(
    private openaiApiService: OpenaiApiService,
    private sqlitedbService: SqlitedbService,
    private azureTtsService: AzureTtsService,
    private statusService: StatusService
  ) {}

  async ngAfterViewInit() {
    await SplashScreen.hide();
  }

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
          this.openaiApiService
            .createThreadMessage(audioTranscriptionObject.text, threadId)
            .pipe(
              switchMap(() =>
                this.sqlitedbService.addUserChatHistory(
                  audioTranscriptionObject.text
                )
              )
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
          this.sqlitedbService
            .addAssistantChatHistory(
              aiConversationResponseObject.conversation,
              aiConversationResponseObject.grammar,
              aiConversationResponseObject.colloquial
            )
            .pipe(
              switchMap(() =>
                this.azureTtsService.textToSpeech(
                  aiConversationResponseObject.conversation,
                  aiConversationResponseObject.style,
                  aiConversationResponseObject.styleDegress
                )
              ),
              map((blob: Blob) => ({
                audioFile: blob,
                style: aiConversationResponseObject.style,
                grammer: aiConversationResponseObject.grammar,
                colloquial: aiConversationResponseObject.colloquial,
              }))
            )
        )
      )
      .subscribe((response) => {
        this.audioFile = response.audioFile;
        this.statusService.setStyle(response.style);
        this.statusService.setGrammer(response.grammer);
        this.statusService.setColloquial(response.colloquial);
      });
  }
}
