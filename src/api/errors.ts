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
    | "INTERNAL_SERVER_ERROR"
    | "NOT_AUTHENTICATED"
    | "NOT_AUTHORIZED"
    | "BAD_REQUEST"
    | "BAD_JSON_SYNTAX"
    | "GROUP_MEMBER_CONNECTED"
    | "GROUP_NOT_FOUND_OR_USER_NOT_IN_GROUP"
    | "GROUP_INVITATION_NOT_FOUND"
    | "GROUP_MEMBER_NOT_ADMIN"
    | "USER_NOT_IN_GROUP_OR_DOES_NOT_EXIST"
    | "GROUP_IS_NOT_JOINABLE"
    | "INCORRECT_INVITATION_AUTHENTICATION_TOKEN"
    | "USER_ALREADY_IN_GROUP"
    | "INVITATION_ALREADY_SET"
    | "MISSING_FIELDS"
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
