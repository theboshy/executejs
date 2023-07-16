import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import { ErrorHandlerService } from 'app/services/error_handler/error-handler.service';
import { NotificationService } from 'app/services/notifier/notifier.service';
import {CodeExecutionResponseInterface, CodeExecutionResultInterface} from "app/types/code-execution-response.interface";
import {CodeExecutionError} from "errors/code-execution.error";

@Component({
  selector: 'app-code-results',
  templateUrl: './code-results.component.html',
  styleUrls: ['./code-results.component.scss']
})
export class CodeResultsComponent implements  OnChanges {
    constructor(private toastr: NotificationService, private errorHandler: ErrorHandlerService) {}

    codeResultsView: CodeExecutionResultInterface[] | undefined
    @Input()
    codeResults?: CodeExecutionResponseInterface;

    ngOnChanges(changes: SimpleChanges) {
      if (changes.codeResults && changes.codeResults.currentValue) {
        this.handleCodeResults(changes.codeResults.currentValue)
      }
    }

  /**
   * Handles the result from the code execution response
   * @param results result of execution user code in sandbox
   */
    private handleCodeResults(results: CodeExecutionResponseInterface) {
        if (results) {
          console.log(results)
          this.codeResultsView =results.stdout;
          //todo: show results to user
          if (results.stderr) { // show user the error message from the code execution
            if (results.exitCode > 0) {
              throw new CodeExecutionError();
            }
            if (results.exitCode > 1) {
              this.toastr.showError('An unexpected error ocurred during the execution of the code');
              this.errorHandler.handleError(results.stderr)
            }
          }
        }
    }
}
