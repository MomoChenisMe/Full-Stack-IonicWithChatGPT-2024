import { Injectable, computed, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  // 讀取數量
  private loadingCount = signal<number>(0);
  // 讀取狀態
  public loadingState = computed(() => this.loadingCount() > 0);
  // 播放狀態
  private isAudioPlaying = signal<boolean>(false);
  // ReadOnly的播放狀態
  public isAudioPlayingState = this.isAudioPlaying.asReadonly();

  loadingOn() {
    this.loadingCount.update((count) => count + 1);
  }

  loadingOff() {
    this.loadingCount.update((count) => (count === 0 ? 0 : count - 1));
  }

  startPlayingAudio() {
    this.isAudioPlaying.update((oldValue) => true);
  }

  stopPlayingAudio() {
    this.isAudioPlaying.update((oldValue) => false);
  }
}
