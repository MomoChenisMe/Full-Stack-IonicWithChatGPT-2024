import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  SKIP_ADD_BEARER_TOKEN_AUTH_HEADER,
  SKIP_ADD_OPENAI_BASE_URL,
  SKIP_ADD_OPENAI_BETA_HEADER,
} from '../httpInterceptors/http.httpcontexttoken';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AzureTtsService {
  constructor(private httpClient: HttpClient) {}

  public textToSpeech(
    content: string,
    style: string,
    styleDegree: number
  ): Observable<Blob> {
    const ssmlData = `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" version="1.0" xml:lang="en-US"><voice name="en-US-GuyNeural"><mstts:express-as style="${style}" styledegree="${styleDegree}">${content}</mstts:express-as></voice></speak>`;
    return this.httpClient.post(
      'https://eastasia.tts.speech.microsoft.com/cognitiveservices/v1',
      ssmlData,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': environment.azureTTSKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'AI-Conversation',
        },
        responseType: 'blob',
        context: new HttpContext()
          .set(SKIP_ADD_BEARER_TOKEN_AUTH_HEADER, true)
          .set(SKIP_ADD_OPENAI_BETA_HEADER, true)
          .set(SKIP_ADD_OPENAI_BASE_URL, true),
      }
    );
  }
}
