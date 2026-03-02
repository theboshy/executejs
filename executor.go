package main

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/dop251/goja"
)

// Goja error format: "... at <eval>:LINE:COL(offset)"
var errLineRe = regexp.MustCompile(`<eval>:(\d+):`)

// Matches simple top-level variable declarations: const/let/var name = ...
var declRe = regexp.MustCompile(`(?m)^\s*(?:const|let|var)\s+([a-zA-Z_$][\w$]*)`)

const executionTimeout = 5 * time.Second

func executeCode(code string) ExecuteResult {
	start := time.Now()
	result := ExecuteResult{}

	vm := goja.New()
	setupConsole(vm, &result)
	cancelTimeout := startTimeout(vm)
	defer cancelTimeout()

	val, err := vm.RunString(code)
	if err != nil {
		handleError(&result, err)
	} else if repr := formatResult(val); repr != "" {
		result.Output = append(result.Output, OutputLine{Type: "result", Content: repr})
	} else if len(result.Output) == 0 {
		showDeclaredVars(vm, code, &result)
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

// showDeclaredVars inspects all top-level variable declarations in the code,
// evaluates each one in the already-run VM, and appends result lines.
// Only called when execution produced no other output.
func showDeclaredVars(vm *goja.Runtime, code string, result *ExecuteResult) {
	seen := make(map[string]bool)
	for _, m := range declRe.FindAllStringSubmatch(code, -1) {
		name := m[1]
		if seen[name] {
			continue
		}
		seen[name] = true
		if v, err := vm.RunString(name); err == nil {
			if repr := formatResult(v); repr != "" {
				result.Output = append(result.Output, OutputLine{
					Type:    "result",
					Content: name + " = " + repr,
				})
			}
		}
	}
}

// formatResult returns a string representation of the last evaluated expression.
// Returns empty string for undefined/null (nothing meaningful to show).
func formatResult(val goja.Value) string {
	if val == nil || goja.IsUndefined(val) || goja.IsNull(val) {
		return ""
	}
	exported := val.Export()
	switch exported.(type) {
	case map[string]interface{}, []interface{}:
		if b, err := json.Marshal(exported); err == nil {
			return string(b)
		}
	}
	return val.String()
}

// formatArgs joins all arguments of a console call into a single string.
func formatArgs(call goja.FunctionCall) string {
	parts := make([]string, len(call.Arguments))
	for i, arg := range call.Arguments {
		parts[i] = fmt.Sprint(arg)
	}
	return strings.Join(parts, " ")
}
