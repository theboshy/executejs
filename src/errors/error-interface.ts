export interface ErrorInterface {
  systemLogger(error: Error): void; /** logs an error in the system logs*/
}
