import { StatusService } from './../services/status.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
import { switchMap } from 'rxjs';

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
export class HomePage implements OnInit {
  constructor(
    private _statusService: StatusService,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    this.httpClient
      .get('https://localhost:7086/AIEnglishTurtor')
      .pipe(
        switchMap(() =>
          this.httpClient.get('https://localhost:7086/AIEnglishTurtor')
        ),
        switchMap(() =>
          this.httpClient.get('https://localhost:7086/AIEnglishTurtor')
        ),
        switchMap(() =>
          this.httpClient.get('https://localhost:7086/AIEnglishTurtor')
        )
      )
      .subscribe();
  }
}
