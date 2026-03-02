/**
 * Strips the internal stack trace from a Goja error message.
 * Input:  "ReferenceError: x is not defined at <eval>:1:1(0)"
 * Output: "ReferenceError: x is not defined"
 */
export function cleanError(msg) {
  return msg.replace(/\s+at (?:[\w.$]+ \()?<eval>:[\s\S]*$/, '').trim()
}

/**
 * Formats a Date as HH:MM:SS (24-hour, no locale date).
 */
export function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour12: false })
}
