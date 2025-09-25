import { Knex } from "knex";
import { FormSchemaService } from "../../services/formSchemaService";

export async function seed(knex: Knex): Promise<void> {
  // Clean existing data
  await knex("form_schemas").del();

  // Import wellness schema
  const formSchemaService = new FormSchemaService();
  
  try {
    await formSchemaService.importWellnessSchema();
    console.log('✅ Wellness form schema imported successfully');
  } catch (error) {
    console.error('❌ Error importing wellness schema:', error);
    throw error;
  }
}
