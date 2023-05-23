import {ErrorInterface} from "errors/error-interface";

/**
 * handles the desktop api errors
 */
export class ElectronApiError extends Error implements ErrorInterface {
  constructor(message: string = _defaultElectronApiErrorMessage, error?: Error) {
    super(message);
    this.name = _defaultElectronApiErrorName;
    if (error) {
      this.systemLogger(error);
    }
  }

  systemLogger(error: Error): void {
  }
}

export const _defaultElectronApiErrorMessage: string = "Electron API not available";
export const _defaultElectronApiErrorName: string = "ElectronApiError";
