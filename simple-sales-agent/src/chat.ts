import * as z from "zod/v3";
import readline from 'node:readline/promises';
import fs from 'node:fs/promises';
import { AgentInputItem } from '@openai/agents';

import { runSalesAgent } from "./agent";


// CLI runner loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = async (prompt: string): Promise<string> => {
  return rl.question(prompt);
}


const main = async () => {
  let input: AgentInputItem[] = [];
  while(true){
    const chat_input = await question('You: ');
    const trimmed_input = chat_input.trim();

    // Comandos de salida
    if (['exit', 'quit', 'salir'].includes(trimmed_input.toLowerCase())) {
      console.log('\n👋 ¡Hasta luego!');
      break;
    }

    // Procesar mensaje vacío
    if (!trimmed_input) {
      console.log('🤖 Por favor, escribe algo...');
      continue;
    }

    // Mostrar indicador de "escribiendo"
    process.stdout.write('🤖 Agente está escribiendo...');

    const response = await runSalesAgent(input.concat({
      role: 'user',
      content: trimmed_input,
    }));

    // console.log('response history', JSON.stringify(response.history, null, 2));
    // console.log('\n response finalOutput', JSON.stringify(response.finalOutput, null, 2));

    input = response.history
   
    // Limpiar línea y mostrar respuesta
    process.stdout.write('\r\x1b[K'); // Limpiar línea
    console.log(`🤖 Agente: ${response.finalOutput}`);

  }
}

main().catch((error) => {
  console.error('Error en la ejecución:', error);
  process.exit(1);
}).finally(() => {
  rl.close();
});