import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SCRIPT_EXAMPLE_BASIC} from "utils/script.example";

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent {

  @Input()
  content: string = SCRIPT_EXAMPLE_BASIC; //todo: should load in ngOnInit only in dev mode
  @Input()
  options: any;
  @Output() contentEmitter: EventEmitter<string> = new EventEmitter<string>();

  onContentChange(newValue: string) {
    this.contentEmitter.emit(newValue)
  }
}
