import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
} from '@ionic/angular/standalone';
import { Robot3dComponent } from '../components/robot3d/robot3d.component';
import { VoicerecordingComponent } from '../components/voicerecording/voicerecording.component';
import { HttpClient } from '@angular/common/http';
import { AudioRecording } from '@mozartec/capacitor-microphone';
import { AudioResponseModel } from '../models/audio.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    Robot3dComponent,
    VoicerecordingComponent,
  ],
})
export class HomePage {
  constructor(private httpClient: HttpClient) {}

  private convertBase64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  public onVoiceRecordFinished(audioRecording: AudioRecording) {
    // 串接Audio API
    const blob = this.convertBase64ToBlob(
      audioRecording.base64String ?? '',
      audioRecording.mimeType ?? 'audio/aac'
    );
    const formData = new FormData();
    formData.append('file', blob, `audio${audioRecording.format ?? '.m4a'}`);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    this.httpClient
      .post<AudioResponseModel>(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            Authorization: 'Bearer {YOUR API KEY}',
          },
        }
      )
      .subscribe((response) => {
        alert(response.text);
      });
  }
}
