import { Component } from '@angular/core';
import {SCRIPT_EXAMPLE_BASIC} from "utils/script.example";
import {CodeResolver} from "app/services/code_resolver/code-resolver.service";

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent {

  constructor(private codeResolver: CodeResolver) {
  }
  content: string = SCRIPT_EXAMPLE_BASIC; //todo: should load in ngOnInit only in dev mode

  options: any = { //https://codemirror.net/5/doc/manual.html#getValue
    viewportMargin: Infinity,
    lineNumbers: true,
    mode: 'javascript',
    theme: 'copilot' //src/copilot-theme.scss
  }

  onContentChange(newValue: string) {
    this.codeResolver.resolveCode(newValue)
  }
  ngOnInit() {

  }

}
