import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'executejs';
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
