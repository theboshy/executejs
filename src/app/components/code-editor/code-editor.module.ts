import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeEditorComponent } from './code-editor.component';
import {FormsModule} from "@angular/forms";
import {CodemirrorModule} from "@ctrl/ngx-codemirror";

@NgModule({
  declarations: [
    CodeEditorComponent
  ],
  exports: [
    CodeEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CodemirrorModule,
  ]
})
export class CodeEditorModule { }
