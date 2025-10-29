const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test('Electron app screenshot', async () => {
  // Launch Electron app
  const electronApp = await electron.launch({ args: ['main.js'] });

  // Get the first window
  const window = await electronApp.firstWindow();

  // Take screenshot
  await window.screenshot({ path: 'screenshot.png' });

  // Close the app
  await electronApp.close();
});
