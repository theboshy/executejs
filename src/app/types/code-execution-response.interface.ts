export interface CodeExecutionResponseInterface {
  stdout: CodeExecutionResultInterface[] | undefined;
  stderr: string | undefined;
  exitCode: number;
}

export interface CodeExecutionResultInterface {
  line: number | undefined
  response: string | undefined
}