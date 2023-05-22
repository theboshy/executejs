import {Component} from '@angular/core';
import {SCRIPT_EXAMPLE_BASIC} from "utils/script.example";

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
}
