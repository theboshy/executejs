import { Component } from '@angular/core';
import {SCRIPT_EXAMPLE_BASIC} from "utils/script.example";

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent {
  content: string = SCRIPT_EXAMPLE_BASIC; //todo: should load in ngOnInit only in dev mode

  options: any = { //https://codemirror.net/5/doc/manual.html#getValue
    viewportMargin: Infinity,
    lineNumbers: true,
    mode: 'javascript',
    theme: 'copilot' //src/copilot-theme.scss
  }

  ngOnInit() {
  }

}
