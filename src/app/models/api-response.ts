/**
 * Interface for API error responses that come with 200 OK status
 */
export interface ApiErrorResponse {
  Error: boolean;
  Message: string;
  err: string;
}

/**
 * Type guard to check if a response contains an API error
 */
export function isApiErrorResponse(response: any): response is ApiErrorResponse {
  return response && 
         typeof response === 'object' &&
         'Error' in response && 
         response.Error === true &&
         'Message' in response;
}
