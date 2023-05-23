import {ErrorInterface} from "errors/error-interface";

/**
 * handles the api execution failed events
 */
export class CodeExecutionError extends Error implements ErrorInterface {
  constructor(message: string = _defaultCodeExecutionErrorMessage, error?: Error) {
    super(message);
    this.name = _defaultCodeExecutionErrorName;
    if (error) {
      this.systemLogger(error);
    }
  }

  systemLogger(error: Error): void {
  }
}

export const _defaultCodeExecutionErrorMessage: string = "Code Execution Failed";
export const _defaultCodeExecutionErrorName: string = "CodeExecutionError";
