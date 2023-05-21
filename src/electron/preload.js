const { contextBridge, ipcRenderer } = require('electron');
const ChildProcessCodeExecutionService = require('./code_execution/code-execution-service')
const codeExecutionService = new ChildProcessCodeExecutionService();
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

const ipcExposedFunctions = {
  runCommand: (code) => codeExecutionService.executeCode(code)
}


/**
 * Expose the 'electronAPI' object to the window's global scope.
 * The 'electronAPI' object provides a function 'runCommand' for executing a command using 'child_process'.
 */
contextBridge.exposeInMainWorld('electronAPI', ipcExposedFunctions);
