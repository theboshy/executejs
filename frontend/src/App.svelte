<script>
  import { onMount } from 'svelte'
  import * as monaco from 'monaco-editor'
  import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
  import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
  import { ExecuteCode } from '../wailsjs/go/main/App.js'

  // Configure Monaco workers before creating the editor
  globalThis.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'typescript' || label === 'javascript') return new tsWorker()
      return new editorWorker()
    }
  }

  let editorEl = $state(null)
  let output = $state([])
  let isRunning = $state(false)
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

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCode)

    return () => editor.dispose()
  })

  async function runCode() {
    if (isRunning) return
    isRunning = true
    try {
      const result = await ExecuteCode(editor.getValue())
      output = result.output ?? []
      execTime = result.timeMs
      if (result.error) {
        output = [...output, { type: 'error', content: result.error }]
      }
    } catch (err) {
      output = [{ type: 'error', content: String(err) }]
      execTime = null
    } finally {
      isRunning = false
    }
  }

  function clearOutput() {
    output = []
    execTime = null
  }
</script>

<div class="layout">
  <header class="toolbar">
    <span class="brand">ExecuteJS</span>
    <div class="actions">
      <button class="btn btn-run" onclick={runCode} disabled={isRunning}>
        {isRunning ? '⏳ Running…' : '▶ Run'}
      </button>
      <button class="btn btn-clear" onclick={clearOutput}>Clear</button>
    </div>
    {#if execTime !== null}
      <span class="timing">{execTime}ms</span>
    {/if}
  </header>

  <div class="editor-wrap" bind:this={editorEl}></div>

  <section class="console">
    <div class="console-header">Console</div>
    <div class="console-body">
      {#if output.length === 0}
        <span class="console-empty">Run your code to see output here.</span>
      {:else}
        {#each output as line}
          <div class="line line-{line.type}">{line.content}</div>
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

  .btn-clear {
    background: #3c3c3c;
    color: #ccc;
  }

  .btn-clear:hover {
    background: #4e4e4e;
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

  .line-log   { color: #d4d4d4; }
  .line-warn  { color: #d7ba7d; }
  .line-error { color: #f14c4c; }
</style>
