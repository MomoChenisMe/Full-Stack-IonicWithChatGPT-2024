import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  effect,
  signal,
  viewChild,
} from '@angular/core';
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
import {
  Gesture,
  GestureController,
  GestureDetail,
  Animation,
  AnimationController,
} from '@ionic/angular';

@Component({
  selector: 'app-voicerecording',
  standalone: true,
  imports: [IonRippleEffect, IonIcon, CommonModule],
  templateUrl: './voicerecording.component.html',
  styleUrl: './voicerecording.component.scss',
})
export class VoicerecordingComponent {
  // 放大縮小動畫
  private scalingAnimation!: Animation;
  // 長按手勢
  private longPressGesture!: Gesture;
  // 取得錄音按鈕的元素
  private recordingButton = viewChild<ElementRef>('recordingButton');
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

  constructor(
    private gestureCtrl: GestureController,
    private animationCtrl: AnimationController
  ) {
    addIcons({ micOutline });
    effect(async () => {
      // 判斷是否啟動錄音
      if (this.recordingState() === 'start') {
        // 開始放大縮小動畫
        this.scalingAnimation.play();
        // 開始錄音
        Microphone.startRecording();
      } else if (this.recordingState() === 'stop') {
        // 停止放大縮小動畫
        this.scalingAnimation.stop();
        // 停止錄音
        const recordResult = await Microphone.stopRecording();
        alert(recordResult.base64String);
      }
    });
    effect(async () => {
      if (this.recordingButton()) {
        // 建立放大縮小動畫
        this.scalingAnimation = this.animationCtrl
          .create()
          .addElement(this.recordingButton()!.nativeElement)
          .duration(1200)
          .iterations(Infinity)
          .keyframes([
            { offset: 0, transform: 'scale(0.9)', opacity: '1' },
            { offset: 0.5, transform: 'scale(1.2)', opacity: '0.5' },
            { offset: 1, transform: 'scale(0.9)', opacity: '1' },
          ]);
        // 檢查並請求權限
        const hasPermission = await this.checkAndRequestPermissionAsync();
        // 建立長按手勢
        this.longPressGesture = this.gestureCtrl.create(
          {
            el: this.recordingButton()!.nativeElement, // 取得錄音按鈕的元素
            gestureName: 'LongPressGesture', // 長按手勢名稱
            threshold: 0, // 觸發手勢的距離，0表示不需要移動就觸發
            canStart: (ev: GestureDetail) => hasPermission, // 是否可以開始手勢
            onStart: (ev: GestureDetail) => {
              this.recordingState.set('start');
            }, // 開始手勢
            onEnd: (ev: GestureDetail) => {
              this.recordingState.set('stop');
            }, // 結束手勢
          },
          true
        );
        this.longPressGesture.enable(); // 啟用長按手勢
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
}
