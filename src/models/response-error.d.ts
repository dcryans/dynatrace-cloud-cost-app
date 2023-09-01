import { ClientRequestError } from '@dynatrace-sdk/client-classic-environment-v2/types/packages/client/classic-environment-v2/src/lib/error-envelopes/client-request-error';
import type * as stream from 'stream';

export class ErrorEnvelopeError extends ClientRequestError<ErrorEnvelope> {}
export function isErrorEnvelopeError(e: any): e is ErrorEnvelopeError;

export interface ErrorEnvelope {
  error?: ErrorResponse;
}
export interface ErrorResponse {
  /**
   * A short, clear error message without details
   */
  message: string;
  details: ErrorResponseDetails;
  /**
   * Error code, which normally matches the HTTP error code.
   */
  code: number;
}
export interface ErrorResponseDetails {
  /**
   * The exception type.
   */
  exceptionType: string;
  syntaxErrorPosition?: TokenPosition;
  /**
   * The error type, e.g. COMMAND_NAME_MISSING
   */
  errorType: string;
  /**
   * Complete error message.
   */
  errorMessage: string;
  /**
   * The arguments for the message format.
   */
  arguments: string[];
  /**
   * Submitted query string.
   */
  queryString: string;
  /**
   * The corresponding DQL format specifier types for each format specifier used in the error message format.
   */
  errorMessageFormatSpecifierTypes: string[];
  /**
   * The message format of the error message, string.format based.
   */
  errorMessageFormat: string;
}

export interface TokenPosition {
  start: PositionInfo;
  end: PositionInfo;
}
export interface PositionInfo {
  /**
   * Query position column zero based index.
   */
  column: number;
  /**
   * Query position index.
   */
  index: number;
  /**
   * Query position line zero based index.
   */
  line: number;
}
export interface BaseError extends Error {
  readonly name: string;
  readonly cause?: any;
}

export interface HttpClientRequestError extends BaseError {
  /**
   * The error name.
   */
  readonly name: 'RequestError';
  /**
   * The error root cause.
   */
  readonly cause?: any;
}

export interface HttpClientResponseError extends BaseError {
  /**
   * The error name.
   */
  readonly name: 'ResponseError';
  /**
   * The error root cause.
   */
  readonly cause?: any;
  /**
   * The response.
   */
  readonly response: HttpClientResponse;
}

export interface HttpClientResponse {
  /**
   * The URL of the response.
   */
  readonly url: string;
  /**
   * The status code of the response.
   */
  readonly status: number;
  /**
   * The status message corresponding to the status code.
   */
  readonly statusText: string;
  /**
   * The response headers.
   */
  readonly headers: Headers;
  /**
   * Returns the response body in a form that conforms to the specified response body type.
   *
   * @param responseBodyType  The type of the response body.
   * Can be `text`, `json`, `binary`, `form-data`, `array-buffer`, `blob`, `readable-stream`, `buffer` or `stream`.
   * The default response body type is `json`.
   * @throws DataTypeError when the response body does not conform to the specified response body type.
   * @throws UnsupportedOperationError when the response body type is not supported by the platform.
   */
  body<T extends keyof ResponseBodyTypes = 'json'>(responseBodyType?: T): ResponseBodyTypes[T];
}

export type ResponseBodyTypes = {
  /**
   * A text response body type.
   */
  'text': Promise<string>;
  /**
   * A JSON response body type.
   */
  'json': Promise<any>;
  /**
   * A binary body type.
   */
  'binary': Promise<Binary>;
  /**
   * A multipart/form-data body type.
   */
  'form-data': Promise<FormDataResponseBody>;
  /**
   * An ArrayBuffer response body type.
   */
  'array-buffer': Promise<ArrayBuffer>;
  /**
   * A Blob response body type. Browser only.
   */
  'blob': Promise<Blob>;
  /**
   * A ReadableStream response body type. Browser only.
   */
  'readable-stream': ReadableStream<Uint8Array>;
  /**
   * A Buffer response body type. Node only.
   */
  'buffer': Promise<Buffer>;
  /**
   * A Stream response body type. Node only.
   */
  'stream': stream.Readable;
};

export interface TextFormDataResponseField {
  type: 'text';
  name: string;
  value: string;
}
export interface BinaryFormDataResponseField {
  type: 'binary';
  name: string;
  contentType: string;
  filename: string;
  value: Binary;
}
export type FormDataResponseField = TextFormDataResponseField | BinaryFormDataResponseField;
export type FormDataResponseBody = Array<FormDataResponseField>;

export interface Binary {
  /**
   * Returns the binary data in a form that conforms to the specified type.
   *
   * @param type  The type of the data.
   * Can be `text`, `json`, `array-buffer`, `blob`, `readable-stream`, `buffer` or `stream`.
   * @throws DataTypeError when the data does not conform to the specified type.
   * @throws UnsupportedOperationError when the type is not supported by the platform.
   */
  get<T extends keyof DataTypes>(type: T): DataTypes[T];
}

export type DataTypes = {
  /**
   * A text type.
   */
  'text': Promise<string>;
  /**
   * A JSON type.
   */
  'json': Promise<any>;
  /**
   * An ArrayBuffer type.
   */
  'array-buffer': Promise<ArrayBuffer>;
  /**
   * A Blob type. Browser only.
   */
  'blob': Promise<Blob>;
  /**
   * A ReadableStream type. Browser only.
   */
  'readable-stream': ReadableStream<Uint8Array>;
  /**
   * A Buffer type. Node only.
   */
  'buffer': Promise<Buffer>;
  /**
   * A Stream type. Node only.
   */
  'stream': stream.Readable;
};
