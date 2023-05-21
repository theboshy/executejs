import { Injectable } from '@angular/core';
import {CodeExecutionResponseInterface} from "app/types/code-execution-response.interface";

@Injectable({
  providedIn: 'root'
})
export class CodeResolver {

  constructor() { }

  resolveCode(code: string): any {
    // 1. Perform security analysis on the received code
    const isSafe = this.isCodeSafe(code);
    if (!isSafe) {
      return null;
    }
    this.executeCommand(code);
    // 3. Return the analysis result
    return isSafe;
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

  executeCommand(code: string) {
    const electronAPI = (<any>window).electronAPI;
    if (electronAPI) {
      electronAPI.runCommand(code)
        .then((response: CodeExecutionResponseInterface) => {
          console.log(response)
        })
        .catch((error: CodeExecutionResponseInterface) => {
          console.log(error)
        });
    } else {
      console.error('Electron API not available');
    }
  }
}
