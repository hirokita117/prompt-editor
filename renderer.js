document.addEventListener('DOMContentLoaded', () => {
  const promptTemplateEl = document.getElementById('prompt-template');
  const variablesFormEl = document.getElementById('variables-form');
  const previewEl = document.getElementById('preview');

  let variables = {};

  function extractVariables(template) {
    const regex = /(?<!\\){([^{}]+?)}/g;
    const extracted = new Set();
    let match;
    while ((match = regex.exec(template)) !== null) {
      extracted.add(match[1]);
    }
    return Array.from(extracted);
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function replaceVariables(template, values) {
    let result = template;

    for (const [key, value] of Object.entries(values)) {
      const regex = new RegExp(`(?<!\\\\){${escapeRegExp(key)}}`, 'g');
      result = result.replace(regex, value || `{${key}}`);
    }

    result = result.replace(/\\([{}])/g, '$1');

    return result;
  }

  function updatePreview() {
    const template = promptTemplateEl.value;
    const finalPrompt = replaceVariables(template, variables);
    previewEl.textContent = finalPrompt;
  }

  function renderVariablesForm() {
    const template = promptTemplateEl.value;
    const extracted = extractVariables(template);

    // Clear form if no variables
    if (extracted.length === 0) {
      variablesFormEl.innerHTML = '<p class="text-sm text-gray-500">テンプレートに {変数名} を追加すると、ここに入力欄が表示されます。</p>';
      variables = {};
      return;
    }

    // Keep existing values
    const newVariables = {};
    extracted.forEach(key => {
      newVariables[key] = variables[key] || '';
    });
    variables = newVariables;

    // Render form fields
    variablesFormEl.innerHTML = '';
    extracted.forEach(key => {
      const div = document.createElement('div');
      div.className = 'flex items-center space-x-2';

      const label = document.createElement('label');
      label.textContent = `${key}:`;
      label.className = 'font-mono text-sm font-semibold';
      label.htmlFor = `var-${key}`;

      const input = document.createElement('input');
      input.type = 'text';
      input.id = `var-${key}`;
      input.value = variables[key];
      input.className = 'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm bg-white dark:bg-gray-700';
      input.placeholder = key;

      input.addEventListener('input', (event) => {
        variables[key] = event.target.value;
        updatePreview();
      });

      div.appendChild(label);
      div.appendChild(input);
      variablesFormEl.appendChild(div);
    });
  }

  promptTemplateEl.addEventListener('input', () => {
    renderVariablesForm();
    updatePreview();
  });

  // Initial render
  renderVariablesForm();
  updatePreview();
});
