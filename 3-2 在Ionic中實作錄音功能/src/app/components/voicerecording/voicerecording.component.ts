import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  switchMap,
  interval,
  scan,
  map,
  of,
  startWith,
  shareReplay,
} from 'rxjs';
import { IonIcon, IonRippleEffect } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { micOutline } from 'ionicons/icons';
import { Microphone } from '@mozartec/capacitor-microphone';

@Component({
  selector: 'app-voicerecording',
  standalone: true,
  imports: [IonRippleEffect, IonIcon, CommonModule],
  templateUrl: './voicerecording.component.html',
  styleUrl: './voicerecording.component.scss',
})
export class VoicerecordingComponent {
  // 錄音的開關
  public recordingState = signal<'init' | 'start' | 'stop'>('init');
  // 錄音計時器
  public timer = toSignal(
    toObservable(this.recordingState).pipe(
      switchMap((recordingState) =>
        recordingState === 'start'
          ? interval(1000).pipe(
              // 使用scan累加每一秒的值，第一次累加會從0開始
              scan((acc) => acc + 1, 0),
              // 轉換為分鐘和秒數
              map((tick) => ({
                minutes: Math.floor(tick / 60),
                seconds: tick % 60,
              }))
            )
          : // 如果停止錄音，則發出一個重置的時間
            of({ minutes: 0, seconds: 0 })
      ),
      // 將分鐘和秒數重新Format成兩位數顯示
      map((timeData) => ({
        minutes: timeData.minutes.toString().padStart(2, '0'),
        seconds: timeData.seconds.toString().padStart(2, '0'),
      })),
      // 初始值
      startWith({ minutes: '00', seconds: '00' }),
      shareReplay(1)
    ),
    {
      initialValue: { minutes: '00', seconds: '00' },
    }
  );

  constructor() {
    addIcons({ micOutline });
    effect(async () => {
      // 判斷是否啟動錄音
      if (this.recordingState() === 'start') {
        Microphone.startRecording();
      } else if (this.recordingState() === 'stop') {
        const recordResult = await Microphone.stopRecording();
        alert(recordResult.base64String);
      }
    });
  }

  // 檢查並請求權限
  public async checkAndRequestPermissionAsync() {
    const checkPermissionResult = await Microphone.checkPermissions();
    // 如果已經有權限，直接返回true
    if (checkPermissionResult.microphone === 'granted') return true;
    // 如果沒有權限，則請求權限
    const requestPermissionResult = await Microphone.requestPermissions();
    if (requestPermissionResult.microphone === 'granted') {
      return true;
    } else {
      return false;
    }
  }

  // 開始錄音
  public async onStartRecording() {
    const hasPermission = await this.checkAndRequestPermissionAsync();
    if (hasPermission) {
      this.recordingState.set('start');
    } else {
      alert('錄音權限未開啟');
    }
  }

  // 停止錄音
  public onStopRecording() {
    this.recordingState.set('stop');
  }
}
