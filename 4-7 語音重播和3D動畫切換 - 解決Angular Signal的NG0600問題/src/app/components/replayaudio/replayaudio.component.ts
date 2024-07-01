import { StatusService } from './../../services/status.service';
import { CommonModule } from '@angular/common';
import { Component, effect, input } from '@angular/core';
import { IonRippleEffect, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { earOutline } from 'ionicons/icons';

@Component({
  selector: 'app-replayaudio',
  standalone: true,
  imports: [IonIcon, IonRippleEffect, CommonModule],
  templateUrl: './replayaudio.component.html',
  styleUrls: ['./replayaudio.component.scss'],
})
export class ReplayaudioComponent {
  audioFile = input<Blob | null>(null);

  public loadingState = this.statusService.loadingState;
  public audioPlayingState = this.statusService.audioPlayingState;

  constructor(private statusService: StatusService) {
    addIcons({ earOutline });
    effect(() => {
      if (this.audioFile()) {
        this.audioPlay(this.audioFile()!);
      }
    });
  }

  onReplayAudio() {
    if (this.audioFile()) {
      this.audioPlay(this.audioFile()!);
    }
  }

  private audioPlay(audioBlob: Blob) {
    let url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    audio.load();
    audio.onplay = () => {
      this.statusService.startPlayingAudio();
    };
    audio.onended = () => {
      this.statusService.stopPlayingAudio();
    };
    audio.play();
  }
}
