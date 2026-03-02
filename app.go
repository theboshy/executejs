package main

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) OnStartup(ctx context.Context) {
	a.ctx = ctx
}

// OutputLine represents a single line of console output.
type OutputLine struct {
	Type    string `json:"type"`    // "log", "warn", "error"
	Content string `json:"content"` // text to display
}

// ExecuteResult is returned to the frontend after running user code.
type ExecuteResult struct {
	Output    []OutputLine `json:"output"`
	Error     string       `json:"error"`
	ErrorLine int          `json:"errorLine"` // 0 if unknown or not applicable
	TimeMs    float64      `json:"timeMs"`
}

func (a *App) ExecuteCode(code string) ExecuteResult {
	return executeCode(code)
}

func (a *App) CopyToClipboard(text string) error {
	return runtime.ClipboardSetText(a.ctx, text)
}

func (a *App) GetClipboard() (string, error) {
	return runtime.ClipboardGetText(a.ctx)
}
