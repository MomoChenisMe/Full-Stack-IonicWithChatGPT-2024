import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, delay, finalize } from 'rxjs';
import { StatusService } from '../services/status.service';

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
