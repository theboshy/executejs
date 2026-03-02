package main

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/dop251/goja"
)

// Goja error format: "... at <eval>:LINE:COL(offset)"
var errLineRe = regexp.MustCompile(`<eval>:(\d+):`)

const executionTimeout = 5 * time.Second

func executeCode(code string) ExecuteResult {
	start := time.Now()
	result := ExecuteResult{}

	vm := goja.New()
	setupConsole(vm, &result)
	cancelTimeout := startTimeout(vm)
	defer cancelTimeout()

	_, err := vm.RunString(code)
	if err != nil {
		handleError(&result, err)
	}

	result.TimeMs = float64(time.Since(start).Nanoseconds()) / 1e6
	return result
}

// setupConsole registers console.log, console.warn and console.error on the VM.
func setupConsole(vm *goja.Runtime, result *ExecuteResult) {
	console := vm.NewObject()
	for _, level := range []string{"log", "warn", "error"} {
		level := level // capture loop variable
		console.Set(level, func(call goja.FunctionCall) goja.Value {
			result.Output = append(result.Output, OutputLine{
				Type:    level,
				Content: formatArgs(call),
			})
			return goja.Undefined()
		})
	}
	vm.Set("console", console)
}

// startTimeout interrupts the VM after executionTimeout.
// Returns a cancel function that must be deferred by the caller.
func startTimeout(vm *goja.Runtime) func() {
	done := make(chan struct{})
	go func() {
		select {
		case <-time.After(executionTimeout):
			vm.Interrupt("execution timeout: infinite loop detected")
		case <-done:
		}
	}()
	return func() { close(done) }
}

// handleError populates the error fields of the result.
// Timeout errors do not carry a line number since no single line is at fault.
func handleError(result *ExecuteResult, err error) {
	result.Error = err.Error()
	if strings.HasPrefix(result.Error, "execution timeout:") {
		return
	}
	if m := errLineRe.FindStringSubmatch(result.Error); len(m) == 2 {
		if line, parseErr := strconv.Atoi(m[1]); parseErr == nil {
			result.ErrorLine = line
		}
	}
}

// formatArgs joins all arguments of a console call into a single string.
func formatArgs(call goja.FunctionCall) string {
	parts := make([]string, len(call.Arguments))
	for i, arg := range call.Arguments {
		parts[i] = fmt.Sprint(arg)
	}
	return strings.Join(parts, " ")
}
