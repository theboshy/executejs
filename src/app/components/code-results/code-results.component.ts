import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CodeExecutionResponseInterface} from "app/types/code-execution-response.interface";

@Component({
  selector: 'app-code-results',
  templateUrl: './code-results.component.html',
  styleUrls: ['./code-results.component.scss']
})
export class CodeResultsComponent implements  OnChanges {
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
        console.log("sape", results)
        if (results) {
          if (results.stderr) {
            //todo handle error
            return
          }
        }
    }
}
