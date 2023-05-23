import {ErrorHandler, Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler{

  constructor() {
  }
  handleError(error: any): void {
    this.infrastructureErrorHandler(error)
  }

  infrastructureErrorHandler(error: any): void {
    //todo: save real error message to system logger
    console.log("trace error", error)
  }
}
