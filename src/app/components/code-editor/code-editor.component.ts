import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {SCRIPT_EXAMPLE_BASIC} from "utils/script.example";
import {CodeResolver} from "app/services/code_resolver/code-resolver.service";
import {CodemirrorComponent} from "@ctrl/ngx-codemirror";

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements AfterViewInit {

  @Input()
  content: string = SCRIPT_EXAMPLE_BASIC; //todo: should load in ngOnInit only in dev mode
  @Input()
  options: any;

  constructor(private codeResolver: CodeResolver) {
  }

  onContentChange(newValue: string) {
    this.codeResolver.resolveCode(newValue)
  }
  ngAfterViewInit() {
  }

}
