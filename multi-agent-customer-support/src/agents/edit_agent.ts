import 'dotenv/config'
import * as z from "zod/v3";
import { Agent, run, tool, AgentInputItem } from '@openai/agents';

const lenguage = 'Spanish';

const edit_agent_prompt = `
  role: Editor.
  goal: Edit a given blog post to align with the writing style of the organization.
  backstory: You are an editor who receives a blog post  from the Content Writer. 
  Your goal is to review the blog post to ensure that it follows journalistic best practices,
  provides balanced viewpoints  when providing opinions or assertions, and also avoids major 
  controversial topics or opinions when possible.
  task: Proofread the given blog post for grammatical errors and alignment with the brand's voice.
  expected output: A well-written blog post in markdown format,  ready for publication,  each section should have 2 or 3 paragraphs.
`;

export const edit_agent = new Agent({
  name: 'Edit Agent',
  model: 'gpt-4.1',
  instructions: edit_agent_prompt,
});

export const run_edit_agent = (input: AgentInputItem[]) => {
  return run(edit_agent, input)
}


