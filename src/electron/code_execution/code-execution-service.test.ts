const vm = require('vm');

// Función para ejecutar el código
function executeCode(code: any) {
  const sandbox = {
    console: {
      log: (...args: any) => {
        // Imprime los argumentos separados por espacio
        const output = args.map((arg: any) => String(arg)).join(' ');
        process.stdout.write(output + '\n');
      }
    }
  };

  const context = vm.createContext(sandbox);

  try {
    vm.runInContext(code, context);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Código a ejecutar
const code = `
  function sum(a, b) {
    return a + b;
  }

  const result = sum(2, 3);
  console.log('El resultado es:', result);
`;

// Ejecuta el código
executeCode(code);
