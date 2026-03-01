package main

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/dop251/goja"
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

// OutputLine represents a single line of console output
type OutputLine struct {
	Type    string `json:"type"`    // "log", "warn", "error"
	Content string `json:"content"` // text to display
}

// ExecuteResult is what we return to the frontend
type ExecuteResult struct {
	Output []OutputLine `json:"output"`
	Error  string       `json:"error"`
	TimeMs int64        `json:"timeMs"`
}

func (a *App) ExecuteCode(code string) ExecuteResult {
	start := time.Now()
	result := ExecuteResult{}

	vm := goja.New()

	// Override console.log, console.warn, console.error
	console := vm.NewObject()

	formatArgs := func(call goja.FunctionCall) string {
		parts := make([]string, len(call.Arguments))
		for i, arg := range call.Arguments {
			parts[i] = fmt.Sprint(arg)
		}
		return strings.Join(parts, " ")
	}

	console.Set("log", func(call goja.FunctionCall) goja.Value {
		result.Output = append(result.Output, OutputLine{Type: "log", Content: formatArgs(call)})
		return goja.Undefined()
	})

	console.Set("warn", func(call goja.FunctionCall) goja.Value {
		result.Output = append(result.Output, OutputLine{Type: "warn", Content: formatArgs(call)})
		return goja.Undefined()
	})

	console.Set("error", func(call goja.FunctionCall) goja.Value {
		result.Output = append(result.Output, OutputLine{Type: "error", Content: formatArgs(call)})
		return goja.Undefined()
	})

	vm.Set("console", console)

	// Timeout: interrupt after 5 seconds
	done := make(chan struct{})
	go func() {
		select {
		case <-time.After(5 * time.Second):
			vm.Interrupt("execution timeout: infinite loop detected")
		case <-done:
		}
	}()
	defer close(done)

	// Run the code
	_, err := vm.RunString(code)
	if err != nil {
		result.Error = err.Error()
	}

	result.TimeMs = time.Since(start).Milliseconds()
	return result
}
