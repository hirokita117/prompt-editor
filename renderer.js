document.addEventListener('DOMContentLoaded', () => {
  const promptTemplateEl = document.getElementById('prompt-template');
  const variablesFormEl = document.getElementById('variables-form');
  const previewEl = document.getElementById('preview');
  const copyButton = document.getElementById('copy-button');

  let variables = {};

  function extractVariables(template) {
    const regex = /(?<!\\){([a-zA-Z0-9]+)}/g;
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

  // Copy to clipboard functionality
  copyButton.addEventListener('click', async () => {
    const template = promptTemplateEl.value;
    const finalPrompt = replaceVariables(template, variables);
    
    try {
      await navigator.clipboard.writeText(finalPrompt);
      
      // Visual feedback
      const originalText = copyButton.querySelector('span').textContent;
      copyButton.querySelector('span').textContent = 'コピーしました！';
      copyButton.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
      copyButton.classList.add('bg-green-600', 'hover:bg-green-700');
      
      setTimeout(() => {
        copyButton.querySelector('span').textContent = originalText;
        copyButton.classList.remove('bg-green-600', 'hover:bg-green-700');
        copyButton.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
      }, 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
      alert('コピーに失敗しました。もう一度お試しください。');
    }
  });

  // Initial render
  renderVariablesForm();
  updatePreview();
});
