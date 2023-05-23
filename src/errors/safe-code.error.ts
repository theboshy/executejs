import {ErrorInterface} from "errors/error-interface";

/**
 * handles the code safe validation errors
 */
export class SafeCodeError extends Error implements ErrorInterface {
  constructor(message: string = _defaultSafeCodeErrorMessage, error?: Error) {
    super(message);
    this.name = _defaultSafeCodeErrorName;
    if (error) {
      this.systemLogger(error);
    }
  }

  systemLogger(error: Error): void {
  }
}

export const _defaultSafeCodeErrorMessage: string = "Error while resolving code, error is not safe code";
export const _defaultSafeCodeErrorName: string = "ElectronApiError";
