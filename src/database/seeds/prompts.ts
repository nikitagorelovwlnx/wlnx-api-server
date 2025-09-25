import { Knex } from "knex";
import { PromptService } from "../../services/promptService";

export async function seed(knex: Knex): Promise<void> {
  // Clean existing data
  await knex("prompts").del();

  // Import default wellness prompts
  const promptService = new PromptService();
  
  try {
    const prompts = await promptService.importDefaultWellnessPrompts('en-US');
    console.log(`✅ Imported ${prompts.length} wellness interview prompts successfully`);
  } catch (error) {
    console.error('❌ Error importing wellness prompts:', error);
    throw error;
  }
}
