interface ValidationErrorField {
  field: string;
  invalidTag: string;
}

interface ValidationErrorResponse {
  error: "VALIDATION_ERROR";
  fields: ValidationErrorField[];
}

interface TooManyRequestsResponse {
  error: "TOO_MANY_REQUESTS";
  limit: number;
  retryAfterTime: number;
  reason: string;
}

interface ServerErrorWithoutDetailsResponse {
  error:
    | "NOT_AUTHORIZED"
    | "USERNAME_ALREADY_EXISTS"
    | "EMAIL_ALREADY_EXISTS"
    | "LAST_ADMIN_DEMOTION"
    | "LAST_ADMIN_KICK";
}

interface OtherQueryError {
  error: "UNKNOWN_QUERY_ERROR" | "NETWORK_ERROR" | "JSON_PARSE_ERROR";
}

/**
 * A type regrouping all errors that the server can return
 */
export type ServerErrorResponse =
  | ValidationErrorResponse
  | TooManyRequestsResponse
  | ServerErrorWithoutDetailsResponse;

/**
 * A type regrouping all errors that the server can return and **additionnal client-side errors**
 */
export type QueryErrorResponse = ServerErrorResponse | OtherQueryError;
