import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import {
  MicrophoneRecordDataModel,
  TranscriptionResponseModel,
} from '../models/audio.model';
import {
  Observable,
  filter,
  firstValueFrom,
  map,
  concatMap,
  takeWhile,
  tap,
  timer,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ThreadObjectModel,
  DeleteThreadResponseModel,
  ListofObjectModel,
  MessageObjectModel,
  RunObjectModel,
  AIConversationResponseModel,
} from '../models/assistant.model';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import {
  ChatCompletionChunkModel,
  ChatRequestMessageModel,
  ChatRequestModel,
} from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class OpenaiApiService {
  // 用於中斷請求的訊號
  private ctrl = new AbortController();

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

  public createAudioTranscription(
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

  // 建立Thread物件
  public createThread(): Observable<ThreadObjectModel> {
    return this.httpClient.post<ThreadObjectModel>('threads', {});
  }

  public createThreadAsync(): Promise<ThreadObjectModel> {
    return firstValueFrom(this.createThread());
  }

  // 刪除指定的Thread物件
  public deleteThread(threadId: string): Observable<DeleteThreadResponseModel> {
    return this.httpClient.delete<DeleteThreadResponseModel>(
      `threads/${threadId}`
    );
  }

  public deleteThreadAsync(
    threadId: string
  ): Promise<DeleteThreadResponseModel> {
    return firstValueFrom(this.deleteThread(threadId));
  }

  // 新增Message物件到指定的Thread物件中
  public createThreadMessage(
    message: string,
    threadId: string
  ): Observable<MessageObjectModel> {
    return this.httpClient.post<MessageObjectModel>(
      `threads/${threadId}/messages`,
      {
        role: 'user',
        content: message,
      }
    );
  }

  // 在指定的Thread物件中建立Run物件
  public createThreadRun(threadId: string): Observable<RunObjectModel> {
    return this.httpClient.post<RunObjectModel>(`threads/${threadId}/runs`, {
      assistant_id: environment.assistandId,
    });
  }

  // 輪詢Run物件，直到Run物件的狀態為不是in_progress或queued
  public getRunAndPolling(
    threadId: string,
    runId: string
  ): Observable<RunObjectModel> {
    return timer(0, 100).pipe(
      concatMap(() =>
        this.httpClient.get<RunObjectModel>(`threads/${threadId}/runs/${runId}`)
      ),
      tap((response) => console.log('Run polling result:', response)),
      takeWhile(
        (response) =>
          response.status === 'in_progress' || response.status === 'queued',
        true
      ),
      filter(
        (response) =>
          response.status !== 'in_progress' && response.status !== 'queued'
      )
    );
  }

  // 取得指定的Thread物件的最新Message物件
  public getThreadMessage(
    threadId: string,
    runId: string
  ): Observable<AIConversationResponseModel> {
    return this.httpClient
      .get<ListofObjectModel<MessageObjectModel>>(
        `threads/${threadId}/messages?run_id=${runId}`
      )
      .pipe(
        tap((res) => console.log('Get Thread Message:', res)),
        map((res) => {
          const textValue = res.data[0].content[0].text.value;
          try {
            const resultValue: AIConversationResponseModel =
              JSON.parse(textValue);
            return resultValue;
          } catch (error) {
            throw new Error('No text value in response');
          }
        })
      );
  }

  public createChatCompletionsByStream(
    chatMessages: ChatRequestMessageModel[],
    temperature: number = 1
  ) {
    const requestBody: ChatRequestModel = {
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: temperature,
      stream: true,
    };
    return new Observable<string>((observer) => {
      fetchEventSource('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${environment.openAIAPIKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: this.ctrl.signal,
        onmessage(msg) {
          // 接收訊息事件
          // 如果訊息不是[DONE]則將訊息發送給觀察者
          if (msg.data !== '[DONE]') {
            const chatCompletionChunkObject: ChatCompletionChunkModel =
              JSON.parse(msg.data);
            if (chatCompletionChunkObject.choices[0].finish_reason !== 'stop') {
              observer.next(chatCompletionChunkObject.choices[0].delta.content);
            }
          }
        },
        onclose() {
          // 連線關閉事件
          console.log('%c Open AI API Close', 'color: red');
          observer.complete();
        },
        onerror(err) {
          // 錯誤處理事件
          observer.error(new Error(err));
        },
      });
    });
  }

  public abortChatCompletionsEventSource() {
    this.ctrl.abort();
  }
}
