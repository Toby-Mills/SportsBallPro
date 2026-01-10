import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { isApiErrorResponse } from '../models/api-response';

/**
 * HTTP Interceptor that checks for API errors in 200 OK responses
 * The WebSports API sometimes returns 200 OK with error objects in the body
 */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    tap({
      next: (event: any) => {
        // Check if this is an HTTP response with a body
        if (event.type === 4 && event.body) { // HttpEventType.Response = 4
          // Check if the response body contains an API error
          if (isApiErrorResponse(event.body)) {
            // Convert the successful response into an error
            throw new HttpErrorResponse({
              error: event.body,
              headers: event.headers,
              status: 400, // Treat as bad request
              statusText: 'WebSports Error',
              url: event.url || undefined
            });
          }
        }
      }
    })
  );
};
