import { Injectable, computed, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private loadingCount = signal<number>(0);
  loadingState = computed(() => this.loadingCount() > 0);
  loadingOn() {
    this.loadingCount.update((count) => count + 1);
  }
  loadingOff() {
    this.loadingCount.update((count) => (count === 0 ? 0 : count - 1));
  }
}
