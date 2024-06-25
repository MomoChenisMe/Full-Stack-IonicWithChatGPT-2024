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
  private audioPlaying = signal<boolean>(false);
  // ReadOnly的播放狀態
  public audioPlayingState = this.audioPlaying.asReadonly();
  // 當前說話風格
  private style = signal<string>('friendly');
  // ReadOnly的說話風格
  public styleState = this.style.asReadonly();

  public loadingOn() {
    this.loadingCount.update((count) => count + 1);
  }

  public loadingOff() {
    this.loadingCount.update((count) => (count === 0 ? 0 : count - 1));
  }

  public startPlayingAudio() {
    this.audioPlaying.update((oldValue) => true);
  }

  public stopPlayingAudio() {
    this.audioPlaying.update((oldValue) => false);
  }

  public setStyle(style: string) {
    this.style.update(() => style);
  }
}
