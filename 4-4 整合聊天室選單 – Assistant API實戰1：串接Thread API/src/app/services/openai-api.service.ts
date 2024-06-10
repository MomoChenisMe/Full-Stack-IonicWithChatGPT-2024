import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  MicrophoneRecordDataModel,
  TranscriptionResponseModel,
} from '../models/audio.model';
import { Observable, firstValueFrom } from 'rxjs';
import {
  ThreadObjectModel,
  DeleteThreadResponseModel,
} from '../models/assistant.model';

@Injectable({
  providedIn: 'root',
})
export class OpenaiApiService {
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

  createAudioTranscription(
    microphoneRecordData: MicrophoneRecordDataModel
  ): Observable<TranscriptionResponseModel> {
    const blob = this.convertBase64ToBlob(
      microphoneRecordData.base64String,
      microphoneRecordData.mimeType
    );
    const formData = new FormData();
    formData.append('file', blob, `audio${microphoneRecordData.format}`);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    return this.httpClient.post<TranscriptionResponseModel>(
      'audio/transcriptions',
      formData
    );
  }

  createThread(): Observable<ThreadObjectModel> {
    return this.httpClient.post<ThreadObjectModel>('threads', {});
  }

  createThreadAsync(): Promise<ThreadObjectModel> {
    return firstValueFrom(this.createThread());
  }

  deleteThread(threadId: string): Observable<DeleteThreadResponseModel> {
    return this.httpClient.delete<DeleteThreadResponseModel>(
      `threads/${threadId}`
    );
  }

  deleteThreadAsync(threadId: string): Promise<DeleteThreadResponseModel> {
    return firstValueFrom(this.deleteThread(threadId));
  }
}
