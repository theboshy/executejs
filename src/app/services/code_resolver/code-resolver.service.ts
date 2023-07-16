import { Injectable } from '@angular/core';
import {CodeExecutionResponseInterface} from "app/types/code-execution-response.interface";
import {ElectronApiError} from "errors/electron-api.error";
import {SafeCodeError} from "errors/safe-code.error";
import {CodeExecutionError} from "errors/code-execution.error";

@Injectable({
  providedIn: 'root'
})
export class CodeResolver {

  constructor() { }

  async resolveCode(code: string): Promise<CodeExecutionResponseInterface> {
    // 1. Perform security analysis on the received code
    const isSafe = this.isCodeSafe(code);
    if (!isSafe) {
      throw new SafeCodeError();
    }
    //todo: add a console.log wrapper any time there is a function call like add(1) wrapp into console.log(add(1))
    const commandResult = await this.executeCommand(code);
    return commandResult;
  }

  isCodeSafe(code: string): boolean {
    // Define a list of disallowed functions or keywords that may pose security risks
    const disallowedFunctions = ['eval', 'setTimeout'];

    // Check if the code contains any disallowed functions
    for (const func of disallowedFunctions) {
      if (code.includes(func)) {
        return false; // Code is considered unsafe if a disallowed function is found
      }
    }
    // Perform additional security checks if needed

    return true; // If the code passes all security checks, consider it safe
  }

  async executeCommand(code: string): Promise<CodeExecutionResponseInterface> {
      const electronAPI = (<any>window).electronAPI;
      if (electronAPI) {
        try {
          const result = await electronAPI.runCommand(code);
          if (result.exitCode > 2) {
             throw new CodeExecutionError();
          }
          //todo: add other validations
          return result;
        } catch (error: any) {
          throw new ElectronApiError("There was an error with the API", error);
        }
      } else {
        throw new ElectronApiError();
      }
  }

}
