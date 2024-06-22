import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  bearerTokenHttpInterceptor,
  loadingHttpInterceptor,
  openAIBetaHeaderHttpInterceptor,
  openAIBaseURLHttpInterceptor,
} from './app/httpInterceptors/http.interceptor.functions';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        loadingHttpInterceptor,
        bearerTokenHttpInterceptor,
        openAIBetaHeaderHttpInterceptor,
        openAIBaseURLHttpInterceptor,
      ]) // 加入攔截器
    ), // 加入HttpClient的提供者
  ],
});
