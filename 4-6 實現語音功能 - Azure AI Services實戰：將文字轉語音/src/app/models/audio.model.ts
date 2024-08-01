export interface MicrophoneRecordDataModel {
  base64String: string;
  mimeType: string;
  format: string;
}

export interface TranscriptionResponseModel {
  text: string;
}
