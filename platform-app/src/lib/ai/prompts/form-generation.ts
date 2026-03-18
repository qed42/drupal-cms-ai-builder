export const FORM_GENERATION_PROMPT = `You are a UX designer. Generate a contact form definition for a {industry} business website.

Business: {name}
Industry: {industry}
Audience: {audience}

Generate a JSON object with a "fields" array. Each field has:
- "name": field machine name (snake_case)
- "type": one of "text", "email", "tel", "textarea", "select", "checkbox"
- "label": human-readable label
- "required": boolean
- "options": array of strings (only for "select" type)

Rules:
- Always include: name (text, required), email (email, required), message (textarea, required)
- Add 1-3 industry-specific fields:
  - Healthcare: preferred appointment time (select), insurance provider (text)
  - Legal: case type (select), preferred consultation method (select)
  - Real estate: property interest (select), budget range (select)
  - Restaurant: party size (select), reservation date preference (text)
  - Professional services: project timeline (select), budget range (select)
  - Other: subject (text)
- Add phone (tel, optional) for industries where phone contact is common
- Keep total fields between 4-8
{compliance_fields}

Return ONLY valid JSON with a "fields" array, no markdown.`;

export function buildFormPrompt(data: {
  name: string;
  industry: string;
  audience: string;
  compliance_flags: string[];
}): string {
  let compliance = "";
  if (data.compliance_flags.includes("hipaa")) {
    compliance +=
      '\n- Add a "hipaa_consent" checkbox field: "I consent to the electronic transmission of my health information"';
  }
  if (data.compliance_flags.includes("gdpr")) {
    compliance +=
      '\n- Add a "gdpr_consent" checkbox field: "I consent to the processing of my personal data"';
  }

  return FORM_GENERATION_PROMPT.replace(/\{industry\}/g, data.industry)
    .replace("{name}", data.name)
    .replace("{audience}", data.audience)
    .replace(
      "{compliance_fields}",
      compliance ? `\nCompliance fields:${compliance}` : ""
    );
}
