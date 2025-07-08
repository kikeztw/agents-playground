import 'dotenv/config'
import * as z from "zod/v3";
import { Agent, run, tool, AgentInputItem } from '@openai/agents';

import { edit_agent } from './edit_agent';
import { writer_agent } from './writer_agent';
import { planner_agent } from './planner_agent';


export const orchestrator_agent = Agent.create({
  name: 'Research Write Article Agent',
  model: 'gpt-4.1',
  handoffs: [edit_agent, writer_agent, planner_agent],
});

export const run_orchestrator_agent = (input?: AgentInputItem[]) => {
  return run(orchestrator_agent, input || [])
}


