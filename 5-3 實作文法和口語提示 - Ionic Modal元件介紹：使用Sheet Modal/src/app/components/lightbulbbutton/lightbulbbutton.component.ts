import { SqlitedbService } from '../../services/sqlitedb.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import {
  IonIcon,
  IonModal,
  IonHeader,
  IonContent,
  IonButton,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bulbOutline, closeOutline } from 'ionicons/icons';
import { StatusService } from 'src/app/services/status.service';

@Component({
  selector: 'app-lightbulbbutton',
  imports: [
    IonButton,
    CommonModule,
    IonIcon,
    IonModal,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonButtons,
  ],
  templateUrl: './lightbulbbutton.component.html',
  styleUrls: ['./lightbulbbutton.component.scss'],
  standalone: true,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('100ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('100ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class LightbulbbuttonComponent implements OnInit {
  grammerState = this.statusService.grammerState;
  colloquialState = this.statusService.colloquialState;
  hasGrammerorColloquial = computed(
    () => this.grammerState() || this.colloquialState()
  );
  userLastSentence = signal<string>('');

  constructor(
    private sqlitedbService: SqlitedbService,
    private statusService: StatusService
  ) {
    addIcons({ bulbOutline, closeOutline });
  }

  async ngOnInit() {
    const gcPromptsData =
      await this.sqlitedbService.getAILastGrammerAndColloquialAsync();
    this.statusService.setGrammer(gcPromptsData.grammar);
    this.statusService.setColloquial(gcPromptsData.colloquial);
  }

  async onIonModalWillPresent() {
    const userLastSentenceData =
      await this.sqlitedbService.getUserLastSentenceAsync();
    this.userLastSentence.set(userLastSentenceData);
  }
}
