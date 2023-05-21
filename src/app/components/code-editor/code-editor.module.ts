import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeEditorComponent } from './code-editor.component';
import {FormsModule, NgModel, ReactiveFormsModule} from "@angular/forms";
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
    ReactiveFormsModule,
    CodemirrorModule,
  ]
})
export class CodeEditorModule { }
