# ExecuteJS

A lightweight desktop JavaScript playground. Write code, run it instantly, see the output — no browser devtools, no Node terminal, no ceremony.

The goal is a tool that's actually fast to open and use. You hit a shortcut, type some JS, press Ctrl+Enter, and you're done. No tabs to manage, no console to dig through.

## What it does

- Runs JavaScript via an embedded engine ([Goja](https://github.com/dop251/goja)) — the app binary is self-contained, no Node.js needed at runtime
- Monaco editor with syntax highlighting, the same one VS Code uses
- Console output with `log`, `warn`, and `error` coloring
- REPL-style result display — expressions evaluate inline, declared variables show their values automatically
- Run the full file or just a selected snippet
- Error markers directly on the line that failed
- Execution time shown after each run
- 5-second timeout to catch infinite loops

## A note on how this was built

> This project is an experiment as much as it is a tool. A large chunk of the code — probably around 60% — was written through AI-assisted development using Claude Code, what some people loosely call "vibe coding." The goal was to test how far you can realistically get building real software with an AI doing most of the heavy lifting, while also using it as an excuse to dust off a project idea that had been sitting around for a while.
It works, and the architecture is reasonable, but treat the code accordingly. It hasn't been production-hardened, and some decisions were made by an AI that didn't fully understand the context. Read it critically before building anything serious on top of it.

## Stack

Go + [Wails v2](https://wails.io) + [Svelte 5](https://svelte.dev) + [Monaco Editor](https://microsoft.github.io/monaco-editor/) + [Goja](https://github.com/dop251/goja) (JS engine, pure Go)

Produces a native desktop binary. The frontend runs in a WebView but there's no Electron, no Chromium bundled — just the system WebView.

## Use as a template

If you want to build your own custom JS editor or playground, this repo is a decent starting point. The execution engine (`executor.go`) is decoupled from the UI, the Wails bridge is thin, and Svelte + Monaco is a solid combo for editor UIs. Fork it, gut what you don't need, and build from there.

## Setup

**Prerequisites:** Go 1.22+, Node.js 18+, and [Wails v2](https://wails.io/docs/gettingstarted/installation).

```bash
# Install Wails CLI (once)
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Clone and install frontend deps
git clone https://github.com/nised/executejs
cd executejs
cd frontend && npm install && cd ..
```

## Running

```bash
# Dev mode with hot reload
wails dev

# Production build
wails build
# Output: build/bin/executejs
```

## Tests

```bash
# Go (backend)
go test ./...

# Frontend utils
cd frontend && npm test
```
