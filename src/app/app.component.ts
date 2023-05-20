import {Component, Input} from '@angular/core';
import {CodemirrorComponent} from "@ctrl/ngx-codemirror";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'executejs';
  content: string = "console.log('hey')";

  ngOnInit() {
  }
  executeCommand() {
    const electronAPI = (<any>window).electronAPI;
    if (electronAPI) {
      electronAPI.runCommand('ls')
        .then((stdout:any) => {
          console.log('Command output:', stdout);
        })
        .catch((error:any) => {
          console.error('Error executing command:', error);
        });
    } else {
      console.error('Electron API not available');
    }
  }
}
