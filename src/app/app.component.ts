import {Component} from '@angular/core';
import {SCRIPT_EXAMPLE_BASIC} from "utils/script.example";
import {CodeResolver} from "app/services/code_resolver/code-resolver.service";
import {ElectronApiError} from "errors/electron-api.error";
import {ErrorHandlerService} from "app/services/error_handler/error-handler.service";
import {ToastrService} from "ngx-toastr";
import {CodeExecutionResponseInterface} from "app/types/code-execution-response.interface";
import {SafeCodeError} from "errors/safe-code.error";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'executejs';
  protected readonly SCRIPT_EXAMPLE_BASIC = SCRIPT_EXAMPLE_BASIC;
  options: any = { //https://codemirror.net/5/doc/manual.html#getValue
    viewportMargin: Infinity,
    lineNumbers: true,
    mode: 'javascript',
    theme: 'copilot', //src/copilot-theme.scss
  }
  codeResults?: CodeExecutionResponseInterface;

  constructor(private codeResolver: CodeResolver, private toastr: ToastrService) {
  }

  /**
   * handles the editor code whenever this changes
   * @param newValue
   */
  async onEditorContentChange(newValue: any) {
    try {
      this.codeResults = await this.codeResolver.resolveCode(newValue)
    } catch (error: any) {
      this.toastr.error(error.message);
    }
  }
}
