const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test('Electron app screenshot', async () => {
  // Launch Electron app
  const electronApp = await electron.launch({ args: ['main.js'] });

  // Get the first window
  const window = await electronApp.firstWindow();

  // Fill the textarea and move cursor to the beginning
  const promptTemplate = await window.locator('#prompt-template');
  await promptTemplate.fill('This is a long text to test cursor visibility.');
  await promptTemplate.press('Home');

  // Take screenshot
  await window.screenshot({ path: 'screenshot.png' });

  // Close the app
  await electronApp.close();
});
