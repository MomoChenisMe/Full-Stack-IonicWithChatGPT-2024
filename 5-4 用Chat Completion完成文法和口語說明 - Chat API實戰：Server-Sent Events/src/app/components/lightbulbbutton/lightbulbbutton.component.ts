import { SqlitedbService } from '../../services/sqlitedb.service';
import { trigger, style, transition, animate } from '@angular/animations';
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
import { finalize } from 'rxjs';
import { ChatRequestMessageModel } from 'src/app/models/chat.model';
import { OpenaiApiService } from 'src/app/services/openai-api.service';
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
  aiGeneratedResponse = signal<string>('');
  isGPTGenerating = signal<boolean>(false);

  constructor(
    private sqlitedbService: SqlitedbService,
    private statusService: StatusService,
    private openaiApiService: OpenaiApiService
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
    // 清除上次的回應
    this.aiGeneratedResponse.set('');
  }

  onIonModalDidPresent() {
    this.isGPTGenerating.set(true);
    this.openaiApiService
      .createChatCompletionsByStream(this.getFullChatMessages(), 0.7)
      .pipe(finalize(() => this.isGPTGenerating.set(false)))
      .subscribe((chatChunkResultString) => {
        this.aiGeneratedResponse.update((lastValue) => {
          return lastValue + chatChunkResultString;
        });
      });
  }

  private getFullChatMessages(): ChatRequestMessageModel[] {
    let messages: ChatRequestMessageModel[] = [
      {
        role: 'system',
        content:
          '1. You are now a professional English AI tutor. 2. Your main responsibility is to explain and clarify grammatical or colloquial issues and errors in English sentences. 3. Please use Traditional Chinese (Taiwan) in all your responses. 4. Replace any newline characters (\n) with HTML <br>.',
      },
    ];

    if (this.grammerState()) {
      messages.push({
        role: 'system',
        content:
          'Identify any grammatical errors or issues in the following sentence, and provide a detailed explanation of the errors along with suggestions for improvement. Use the following format:錯誤說明: <Explanation of the error in the sentence><br><br>改正建議: <Suggestion for correcting the sentence><br>',
      });
    }

    if (this.colloquialState()) {
      messages.push({
        role: 'system',
        content:
          'Identify any colloquial issues in the following sentence, explain the appropriate context for the original sentence, and provide a more colloquial example. Use the following format:原始句子用法: <Explanation of why the original sentence is not suitable for colloquial use><br><br>更口語的建議: <More colloquial example><br>',
      });
    }

    messages.push({
      role: 'user',
      content: this.userLastSentence(),
    });

    return messages;
  }
}
