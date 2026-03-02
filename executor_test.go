package main

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

// -- executeCode tests -------------------------------------------------------

func TestExecuteCode_ConsoleLog(t *testing.T) {
	tests := []struct {
		name    string
		code    string
		wantOut []OutputLine
	}{
		{
			name:    "single string",
			code:    "console.log('hello')",
			wantOut: []OutputLine{{Type: "log", Content: "hello"}},
		},
		{
			name:    "multiple arguments joined with space",
			code:    "console.log('sum:', 1 + 2)",
			wantOut: []OutputLine{{Type: "log", Content: "sum: 3"}},
		},
		{
			name: "multiple calls produce multiple lines",
			code: "console.log('a'); console.log('b')",
			wantOut: []OutputLine{
				{Type: "log", Content: "a"},
				{Type: "log", Content: "b"},
			},
		},
		{
			name:    "warn",
			code:    "console.warn('careful')",
			wantOut: []OutputLine{{Type: "warn", Content: "careful"}},
		},
		{
			name:    "error via console.error",
			code:    "console.error('oops')",
			wantOut: []OutputLine{{Type: "error", Content: "oops"}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := executeCode(tt.code)
			assert.Empty(t, result.Error)
			assert.Equal(t, tt.wantOut, result.Output)
		})
	}
}

func TestExecuteCode_REPLResult(t *testing.T) {
	tests := []struct {
		name        string
		code        string
		wantContent string
		wantType    string
	}{
		{
			name:        "arithmetic expression",
			code:        "2 + 4",
			wantContent: "6",
			wantType:    "result",
		},
		{
			name:        "string expression",
			code:        "'hello'",
			wantContent: "hello",
			wantType:    "result",
		},
		{
			name:        "array literal",
			code:        "[1, 2, 3]",
			wantContent: "[1,2,3]",
			wantType:    "result",
		},
		{
			name:        "object literal",
			code:        "({ name: 'Peter' })",
			wantContent: `{"name":"Peter"}`,
			wantType:    "result",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := executeCode(tt.code)
			assert.Empty(t, result.Error)
			assert.Len(t, result.Output, 1)
			assert.Equal(t, tt.wantType, result.Output[0].Type)
			assert.Equal(t, tt.wantContent, result.Output[0].Content)
		})
	}
}

func TestExecuteCode_DeclaredVars(t *testing.T) {
	tests := []struct {
		name        string
		code        string
		wantContent string
	}{
		{
			name:        "const with array",
			code:        "const nums = [1, 2, 3]",
			wantContent: "nums = [1,2,3]",
		},
		{
			name:        "let with number",
			code:        "let x = 42",
			wantContent: "x = 42",
		},
		{
			name:        "var with object",
			code:        "var user = { name: 'Peter' }",
			wantContent: `user = {"name":"Peter"}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := executeCode(tt.code)
			assert.Empty(t, result.Error)
			assert.Len(t, result.Output, 1)
			assert.Equal(t, "result", result.Output[0].Type)
			assert.Equal(t, tt.wantContent, result.Output[0].Content)
		})
	}
}

func TestExecuteCode_NoOutputForUndefined(t *testing.T) {
	// Declarations that resolve to undefined should produce no output lines
	tests := []struct {
		name string
		code string
	}{
		{"void expression", "void 0"},
		{"undefined literal", "undefined"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := executeCode(tt.code)
			assert.Empty(t, result.Error)
			assert.Empty(t, result.Output)
		})
	}
}

func TestExecuteCode_Errors(t *testing.T) {
	tests := []struct {
		name          string
		code          string
		wantErrSubstr string
		wantErrorLine int
	}{
		{
			name:          "reference error carries line number",
			code:          "undeclaredVar",
			wantErrSubstr: "ReferenceError",
			wantErrorLine: 1,
		},
		{
			name:          "error on second line has correct line number",
			code:          "const x = 1\nundeclaredVar",
			wantErrSubstr: "ReferenceError",
			wantErrorLine: 2,
		},
		{
			name:          "type error",
			code:          "null.property",
			wantErrSubstr: "TypeError",
			wantErrorLine: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := executeCode(tt.code)
			assert.Contains(t, result.Error, tt.wantErrSubstr)
			assert.Equal(t, tt.wantErrorLine, result.ErrorLine)
		})
	}
}

func TestExecuteCode_Timeout(t *testing.T) {
	// NOTE: this test takes ~5s (executionTimeout duration) by design.
	t.Log("waiting for timeout (~5s)...")
	result := executeCode("while(true){}")
	assert.True(t, strings.HasPrefix(result.Error, "execution timeout:"))
	assert.Equal(t, 0, result.ErrorLine, "timeout errors must not carry a line number")
}

func TestExecuteCode_TimingIsPopulated(t *testing.T) {
	result := executeCode("1 + 1")
	assert.GreaterOrEqual(t, result.TimeMs, 0.0)
}

// -- handleError tests -------------------------------------------------------

func TestHandleError_TimeoutSkipsLineExtraction(t *testing.T) {
	result := &ExecuteResult{}
	handleError(result, mockError("execution timeout: infinite loop detected at foo (<eval>:3:1)"))
	assert.Equal(t, 0, result.ErrorLine)
}

func TestHandleError_ExtractsLineNumber(t *testing.T) {
	result := &ExecuteResult{}
	handleError(result, mockError("ReferenceError: x is not defined at <eval>:7:1(0)"))
	assert.Equal(t, 7, result.ErrorLine)
}

// -- formatArgs tests --------------------------------------------------------

func TestFormatArgs(t *testing.T) {
	// formatArgs is tested indirectly via console.log output.
	// Direct unit test via a real Goja call is done through executeCode above.
	result := executeCode("console.log('a', 'b', 'c')")
	assert.Equal(t, "a b c", result.Output[0].Content)
}

// -- helpers -----------------------------------------------------------------

// mockError wraps a string as an error value.
type mockError string

func (e mockError) Error() string { return string(e) }
