import { chromium } from 'playwright';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { TOOL_DEFINITIONS, executeTool, BugReport } from './tools';

dotenv.config({ path: '.env.test' });

const MAX_ACTIONS = 35;

const SYSTEM_PROMPT = `You are an expert QA tester exploring a summer camp scheduling web application called KBIACal.

The app has:
- A LEFT SIDEBAR with class categories (accordion-style) and a search box at the top
- A CALENDAR GRID showing a weekly schedule (M-F, 8AM-8PM in 30-min slots)
- WEEK TABS at the top (Weeks 5, 6, 7, 8) to switch between weeks
- CHILD TABS next to week tabs to switch between children
- A COST BAR below the header showing per-child and total costs
- An AI ASSISTANT toggle button in the header (right side)
- CLASS BLOCKS on the grid that can be clicked to see a popup with Remove option
- Sidebar CLASS ITEMS that can be clicked to see a popup with Add/Waitlist options

You are looking at the app through an iframe. All your click/fill actions target elements INSIDE the iframe.

Your goal: systematically explore the application and find bugs, UX issues, visual glitches, or unexpected behaviors. Try:
- Opening different categories and adding/removing classes
- Switching between weeks and children
- Using the search box
- Checking if costs update correctly
- Looking for visual overlap or misalignment
- Trying edge cases: rapid actions, empty states, boundary conditions
- Checking the setup page (/kbiacal/setup) for issues too

After each action, analyze the result carefully. If something looks wrong (visual glitch, error message, unexpected behavior, console error), use report_bug immediately.

Start by taking a screenshot to see the current state, then explore methodically.`;

async function main() {
  console.log('Starting agentic exploration...\n');

  // Validate environment
  if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
    console.error('Missing TEST_EMAIL or TEST_PASSWORD in .env.test');
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY in .env.test');
    process.exit(1);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const bugs: BugReport[] = [];
  const consoleErrors: string[] = [];

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(`[pageerror] ${err.message}`);
  });

  // Login
  console.log('Logging in...');
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
  await page.goto(`${baseURL}/kbiacal/login`);
  await page.fill('#email', process.env.TEST_EMAIL);
  await page.fill('#password', process.env.TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/kbiacal/, { timeout: 15000 });

  // If redirected to setup, go to scheduler
  if (page.url().includes('/setup')) {
    await page.goto(`${baseURL}/kbiacal`);
  }

  // Wait for scheduler iframe to load
  const frame = page.frameLocator('iframe[title="KBIACal Scheduler"]');
  await frame.locator('#childTabs .child-tab').first().waitFor({ timeout: 15000 });
  console.log('Scheduler loaded. Starting exploration.\n');

  // Take initial screenshot
  const initialScreenshot = (await page.screenshot()).toString('base64');

  // Build conversation with Claude
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/png', data: initialScreenshot },
        },
        {
          type: 'text',
          text: 'Here is the current state of the app. Begin your exploration. Take about 30 actions to thoroughly test the application.',
        },
      ],
    },
  ];

  // Agentic loop
  let actionCount = 0;
  let done = false;

  while (actionCount < MAX_ACTIONS && !done) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOL_DEFINITIONS,
      messages,
    });

    // Process response blocks
    const assistantContent = response.content;
    messages.push({ role: 'assistant', content: assistantContent });

    // Check for tool use
    const toolUseBlocks = assistantContent.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (toolUseBlocks.length === 0) {
      // No tool call — Claude just sent text. Continue.
      const textBlocks = assistantContent.filter(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );
      console.log(`[Claude] ${textBlocks.map(b => b.text).join(' ')}`);
      // Prompt to continue
      messages.push({
        role: 'user',
        content: 'Continue exploring. Use the tools to interact with the app.',
      });
      continue;
    }

    // Execute each tool call
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUseBlocks) {
      actionCount++;
      const input = toolUse.input as Record<string, unknown>;
      console.log(`[Action ${actionCount}/${MAX_ACTIONS}] ${toolUse.name}(${JSON.stringify(input)})`);

      if (toolUse.name === 'done') {
        done = true;
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: 'Exploration complete.',
        });
        break;
      }

      const { result, screenshot } = await executeTool(
        toolUse.name,
        input,
        page,
        frame,
        consoleErrors,
        bugs,
      );

      console.log(`  -> ${result.substring(0, 120)}`);

      // Build tool result with optional screenshot
      const resultContent: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[] = [
        { type: 'text', text: result },
      ];
      if (screenshot) {
        resultContent.push({
          type: 'image',
          source: { type: 'base64', media_type: 'image/png', data: screenshot },
        });
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: resultContent,
      });
    }

    messages.push({ role: 'user', content: toolResults });
  }

  await browser.close();

  // Generate bug report
  console.log('\n' + '='.repeat(60));
  console.log('EXPLORATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Actions taken: ${actionCount}`);
  console.log(`Bugs found: ${bugs.length}`);
  console.log(`Console errors: ${consoleErrors.length}`);

  if (bugs.length > 0) {
    console.log('\n--- BUG REPORTS ---\n');
    const report = bugs.map((bug, i) => [
      `## Bug #${i + 1}: ${bug.title}`,
      `**Severity**: ${bug.severity}`,
      `**Description**: ${bug.description}`,
      `**Steps to reproduce**:`,
      ...bug.steps.map((s, j) => `  ${j + 1}. ${s}`),
      bug.screenshotPath ? `**Screenshot**: ${bug.screenshotPath}` : '',
      '',
    ].join('\n')).join('\n');

    console.log(report);

    // Save to file
    fs.mkdirSync('test-results', { recursive: true });
    const reportPath = `test-results/agentic-bug-report-${Date.now()}.md`;
    fs.writeFileSync(reportPath, `# Agentic Bug Report\n\nDate: ${new Date().toISOString()}\nActions: ${actionCount}\nBugs: ${bugs.length}\n\n${report}`);
    console.log(`Report saved to: ${reportPath}`);
  } else {
    console.log('\nNo bugs found during this exploration session.');
  }

  if (consoleErrors.length > 0) {
    console.log('\n--- CONSOLE ERRORS ---\n');
    consoleErrors.forEach(e => console.log(`  ${e}`));
  }
}

main().catch(err => {
  console.error('Explorer crashed:', err);
  process.exit(1);
});
