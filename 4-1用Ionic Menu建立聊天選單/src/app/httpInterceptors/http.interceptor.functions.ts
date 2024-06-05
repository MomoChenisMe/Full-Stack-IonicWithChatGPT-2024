import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { StatusService } from '../services/status.service';
import { environment } from 'src/environments/environment';

export const loadingHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const statusService = inject(StatusService);
  statusService.loadingOn();
  return next(req).pipe(
    finalize(() => {
      statusService.loadingOff();
    })
  );
};

export const bearerTokenHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  return next(
    req.clone({
      headers: req.headers.set(
        'authorization',
        `Bearer ${environment.openAIAPIKey}`
      ),
    })
  );
};

export const openAIBetaHeaderHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (/^(threads)/.test(req.url)) {
    return next(
      req.clone({
        headers: req.headers.set('OpenAI-Beta', 'assistants=v2'),
      })
    );
  }
  return next(req);
};

export const openAIBaseURLHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  return next(
    req.clone({
      url: 'https://api.openai.com/v1/' + req.url,
    })
  );
};
