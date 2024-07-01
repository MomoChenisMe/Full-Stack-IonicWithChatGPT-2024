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
import {
  SKIP_ADD_BEARER_TOKEN_AUTH_HEADER,
  SKIP_ADD_OPENAI_BASE_URL,
  SKIP_ADD_OPENAI_BETA_HEADER,
} from './http.httpcontexttoken';

/**
 * HttpInterceptor，用於在請求開始和結束時更新讀取狀態
 *
 * @param {HttpRequest<unknown>} req - 要攔截的 HTTP 請求。
 * @param {HttpHandlerFn} next - 下一個攔截器函數。
 * @returns {Observable<HttpEvent<unknown>>} - 包含 HTTP 事件的 Observable 對象。
 */
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

/**
 * HttpInterceptor，用於為每個請求加入 Bearer token。
 *
 * @param {HttpRequest<unknown>} req - 要攔截的 HTTP 請求。
 * @param {HttpHandlerFn} next - 下一個攔截器函數。
 * @returns {Observable<HttpEvent<unknown>>} - 包含 HTTP 事件的 Observable 對象。
 */
export const bearerTokenHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // 如果有設定 SKIP_ADD_BEARER_TOKEN_AUTH_HEADER，則跳過
  if (req.context.get(SKIP_ADD_BEARER_TOKEN_AUTH_HEADER)) {
    return next(req);
  }

  return next(
    req.clone({
      headers: req.headers.set(
        'authorization',
        `Bearer ${environment.openAIAPIKey}`
      ),
    })
  );
};

/**
 * HttpInterceptor，用於為以 "threads" 開頭的請求新增OpenAI Assistant API專屬標頭。
 *
 * @param {HttpRequest<unknown>} req - 要攔截的 HTTP 請求。
 * @param {HttpHandlerFn} next - 下一個攔截器函數。
 * @returns {Observable<HttpEvent<unknown>>} - 包含 HTTP 事件的 Observable 對象。
 */
export const openAIBetaHeaderHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // 如果有設定 SKIP_ADD_OPENAI_BETA_HEADER，則跳過
  if (req.context.get(SKIP_ADD_OPENAI_BETA_HEADER)) {
    return next(req);
  }

  if (/^(threads)/.test(req.url)) {
    return next(
      req.clone({
        headers: req.headers.set('OpenAI-Beta', 'assistants=v2'),
      })
    );
  }
  return next(req);
};

/**
 * HTTP攔截器，用於將所有請求的 URL 修改為 OpenAI API 的Base URL。
 *
 * @param {HttpRequest<unknown>} req - 要攔截的 HTTP 請求。
 * @param {HttpHandlerFn} next - 下一個攔截器函數。
 * @returns {Observable<HttpEvent<unknown>>} - 包含 HTTP 事件的 Observable 對象。
 */
export const openAIBaseURLHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // 如果有設定 SKIP_ADD_OPENAI_BASE_URL，則跳過
  if (req.context.get(SKIP_ADD_OPENAI_BASE_URL)) {
    return next(req);
  }

  return next(
    req.clone({
      url: 'https://api.openai.com/v1/' + req.url,
    })
  );
};
