<script>
  import { onMount, tick } from 'svelte'
  import * as monaco from 'monaco-editor'
  import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
  import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
  import { ExecuteCode, CopyToClipboard, GetClipboard } from '../wailsjs/go/main/App.js'
  import { cleanError, formatTime } from './utils.js'

  // Configure Monaco workers before creating the editor
  globalThis.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'typescript' || label === 'javascript') return new tsWorker()
      return new editorWorker()
    }
  }

  let editorEl = $state(null)
  let consoleBody = $state(null)
  let executions = $state([])   // [{ at: Date, lines: OutputLine[] }]
  let showTimestamps = $state(true)
  let isRunning = $state(false)
  let hasSelection = $state(false)
  let execTime = $state(null)
  let editor

  const DEFAULT_CODE = [
    '// Welcome to ExecuteJS!',
    "console.log('Hello, world!')",
    '',
    'const nums = [1, 2, 3, 4, 5]',
    "console.log('Sum:', nums.reduce((a, b) => a + b, 0))",
  ].join('\n')

  onMount(() => {
    editor = monaco.editor.create(editorEl, {
      value: DEFAULT_CODE,
      language: 'javascript',
      theme: 'vs-dark',
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      padding: { top: 12 },
    })

    editor.onDidChangeCursorSelection(({ selection }) => {
      hasSelection = editor.getModel().getValueInRange(selection).trim().length > 0
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCode)

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, async () => {
      const text = await GetClipboard()
      if (text) editor.trigger('keyboard', 'type', { text })
    })

    return () => editor.dispose()
  })

  const MARKER_OWNER = 'executejs'

  function clearMarkers() {
    monaco.editor.setModelMarkers(editor.getModel(), MARKER_OWNER, [])
  }

  function updateEditorMarkers(errorMsg, errorLine) {
    if (errorLine <= 0) { clearMarkers(); return }
    const model = editor.getModel()
    monaco.editor.setModelMarkers(model, MARKER_OWNER, [{
      startLineNumber: errorLine,
      startColumn: 1,
      endLineNumber: errorLine,
      endColumn: model.getLineMaxColumn(errorLine),
      message: errorMsg,
      severity: monaco.MarkerSeverity.Error,
    }])
  }

  function getCodeToRun() {
    const selected = editor.getModel().getValueInRange(editor.getSelection()).trim()
    return selected || editor.getValue()
  }

  function buildErrorLine(result) {
    return {
      type: 'error',
      content: cleanError(result.error),
      lineNum: result.errorLine > 0 ? result.errorLine : null,
    }
  }

  async function runCode() {
    if (isRunning) return
    isRunning = true
    clearMarkers()
    try {
      const result = await ExecuteCode(getCodeToRun())
      const lines = result.output ?? []
      if (result.error) {
        lines.push(buildErrorLine(result))
        updateEditorMarkers(result.error, result.errorLine)
      }
      if (lines.length > 0) {
        executions = [...executions, { at: new Date(), lines }]
      }
      execTime = result.timeMs
    } catch (err) {
      executions = [...executions, { at: new Date(), lines: [{ type: 'error', content: String(err) }] }]
      execTime = null
    } finally {
      isRunning = false
      await tick()
      if (consoleBody) consoleBody.scrollTop = consoleBody.scrollHeight
    }
  }

  function clearOutput() {
    executions = []
    execTime = null
    clearMarkers()
  }

  function copyOutput() {
    const text = executions.flatMap(exec => {
      const lines = exec.lines.map(l => l.content)
      return showTimestamps ? [`── ${formatTime(exec.at)} ──`, ...lines] : lines
    }).join('\n')
    CopyToClipboard(text)
  }
</script>

<div class="layout">
  <header class="toolbar">
    <span class="brand">ExecuteJS</span>
    <div class="actions">
      <button class="btn btn-run" onclick={runCode} disabled={isRunning}>
        {isRunning ? 'Running...' : hasSelection ? 'Run Selection' : 'Run'}
      </button>
    </div>
    {#if execTime !== null}
      <span class="timing">{execTime < 1 ? execTime.toFixed(2) : Math.round(execTime)}ms</span>
    {/if}
  </header>

  <div class="editor-wrap" bind:this={editorEl}></div>

  <section class="console">
    <div class="console-header">
      <span>Console</span>
      <div class="console-actions">
        <label class="ts-label">
          <input type="checkbox" bind:checked={showTimestamps} />
          <span class="ts-track"><span class="ts-thumb"></span></span>
          <span class="ts-text">timestamps</span>
        </label>
        <button class="console-btn" onclick={copyOutput} disabled={executions.length === 0}>Copy</button>
        <button class="console-btn" onclick={clearOutput}>Clear</button>
      </div>
    </div>
    <div class="console-body" bind:this={consoleBody}>
      {#if executions.length === 0}
        <span class="console-empty">Run your code to see output here.</span>
      {:else}
        {#each executions as exec}
          {#if showTimestamps}
            <div class="exec-timestamp">── {formatTime(exec.at)} ──</div>
          {/if}
          {#each exec.lines as line}
            <div class="line line-{line.type}">
              {#if line.type === 'error' && line.lineNum}
                <span class="line-badge badge-error">Line {line.lineNum}</span>
              {:else if line.type === 'result'}
                <span class="result-arrow">←</span>
              {/if}
              {line.content}
            </div>
          {/each}
        {/each}
      {/if}
    </div>
  </section>
</div>

<style>
  .layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: #1e1e1e;
  }

  /* ── Toolbar ── */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    height: 42px;
    background: #252526;
    border-bottom: 1px solid #3c3c3c;
    flex-shrink: 0;
  }

  .brand {
    font-weight: 700;
    font-size: 14px;
    color: #ccc;
    margin-right: auto;
    letter-spacing: 0.02em;
  }

  .actions {
    display: flex;
    gap: 6px;
  }

  .btn {
    padding: 4px 14px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-run {
    background: #0e7a0d;
    color: #fff;
  }

  .btn-run:not(:disabled):hover {
    background: #128011;
  }

  .timing {
    font-size: 11px;
    color: #888;
    margin-left: 4px;
  }

  /* ── Monaco editor ── */
  .editor-wrap {
    flex: 1;
    min-height: 0;
  }

  /* ── Console output ── */
  .console {
    height: 220px;
    display: flex;
    flex-direction: column;
    background: #1a1a1a;
    border-top: 1px solid #3c3c3c;
    flex-shrink: 0;
  }

  .console-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: #252526;
    border-bottom: 1px solid #3c3c3c;
    flex-shrink: 0;
  }

  .console-actions {
    display: flex;
    gap: 4px;
  }

  /* ── Toggle switch ── */
  .ts-label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    user-select: none;
  }

  .ts-label input {
    display: none;
  }

  .ts-track {
    position: relative;
    width: 28px;
    height: 15px;
    background: #3c3c3c;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .ts-label input:checked ~ .ts-track {
    background: #0e7a0d;
  }

  .ts-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 11px;
    height: 11px;
    background: #ccc;
    border-radius: 50%;
    transition: left 0.2s;
  }

  .ts-label input:checked ~ .ts-track .ts-thumb {
    left: 15px;
  }

  .ts-text {
    font-size: 10px;
    color: #666;
    text-transform: none;
    letter-spacing: 0;
  }

  /* ── Console action buttons ── */
  .console-btn {
    background: none;
    border: none;
    color: #555;
    font-size: 10px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: none;
    letter-spacing: 0;
  }

  .console-btn:not(:disabled):hover {
    color: #aaa;
    background: #3c3c3c;
  }

  .console-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ── Error badge ── */
  .line-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 3px;
    margin-right: 6px;
    vertical-align: middle;
    letter-spacing: 0.03em;
  }

  .badge-error {
    background: #5a1a1a;
    color: #f14c4c;
  }

  .exec-timestamp {
    color: #444;
    font-size: 11px;
    margin: 4px 0 2px;
    user-select: none;
  }

  .console-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
    font-family: 'JetBrains Mono', 'Fira Code', Menlo, monospace;
    font-size: 13px;
    line-height: 1.6;
  }

  .console-empty {
    color: #555;
    font-style: italic;
  }

  .line {
    white-space: pre-wrap;
    word-break: break-all;
  }

  .line-log    { color: #d4d4d4; }
  .line-warn   { color: #d7ba7d; }
  .line-error  { color: #f14c4c; }
  .line-result { color: #9cdcfe; }

  .result-arrow {
    color: #555;
    margin-right: 6px;
    user-select: none;
  }
</style>
