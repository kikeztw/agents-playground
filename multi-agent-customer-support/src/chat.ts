import readline from 'node:readline/promises';
import { run_orchestrator_agent } from "./agents/orchestrator_agent";


// CLI runner loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = async (prompt: string): Promise<string> => {
  return rl.question(prompt);
}

const chat_input = await question('You: ');
const trimmed_input = chat_input.trim();

// Mostrar indicador de "escribiendo"
process.stdout.write('🤖 Agente está escribiendo...');

const response = await run_orchestrator_agent([{ role: 'user', content: trimmed_input }]);
// console.log('response history', JSON.stringify(response.history, null, 2));
// console.log('\n response finalOutput', JSON.stringify(response.finalOutput, null, 2));
// Limpiar línea y mostrar respuesta
process.stdout.write('\r\x1b[K'); // Limpiar línea
console.log(`🤖 Agente: ${response.finalOutput}`);

rl.close();