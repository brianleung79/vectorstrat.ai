import { Page, FrameLocator } from 'playwright';

export interface BugReport {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  steps: string[];
  screenshotPath?: string;
}

export interface PageState {
  url: string;
  screenshotBase64: string;
  consoleErrors: string[];
  visibleText: string;
  classBlockCount: number;
  activeWeek: string;
  activeChild: string;
}

// Tool definitions exposed to Claude
export const TOOL_DEFINITIONS = [
  {
    name: 'click',
    description: 'Click an element inside the scheduler iframe. Use CSS selectors.',
    input_schema: {
      type: 'object' as const,
      properties: {
        selector: { type: 'string', description: 'CSS selector of the element to click' },
      },
      required: ['selector'],
    },
  },
  {
    name: 'fill',
    description: 'Type text into an input field inside the scheduler iframe.',
    input_schema: {
      type: 'object' as const,
      properties: {
        selector: { type: 'string', description: 'CSS selector of the input element' },
        text: { type: 'string', description: 'Text to type' },
      },
      required: ['selector', 'text'],
    },
  },
  {
    name: 'screenshot',
    description: 'Take a screenshot of the current page and return it for visual analysis.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_page_info',
    description: 'Get structured info about the current page state: URL, active week/child, class block count, visible sidebar classes.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_console_errors',
    description: 'Get any JavaScript console errors that have occurred.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'navigate',
    description: 'Navigate the main page to a URL path (e.g., /kbiacal, /kbiacal/setup).',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'URL path to navigate to' },
      },
      required: ['path'],
    },
  },
  {
    name: 'report_bug',
    description: 'Report a potential bug or UX issue you discovered.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Short title for the bug' },
        description: { type: 'string', description: 'Detailed description of what went wrong' },
        severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], description: 'Bug severity' },
        steps: {
          type: 'array',
          items: { type: 'string' },
          description: 'Steps to reproduce',
        },
      },
      required: ['title', 'description', 'severity', 'steps'],
    },
  },
  {
    name: 'done',
    description: 'Finish the exploration session and output the final bug report.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

// Execute a tool action against the browser
export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  page: Page,
  frame: FrameLocator,
  consoleErrors: string[],
  bugs: BugReport[],
): Promise<{ result: string; screenshot?: string }> {
  switch (toolName) {
    case 'click': {
      const selector = input.selector as string;
      try {
        await frame.locator(selector).first().click({ timeout: 5000 });
        await page.waitForTimeout(500);
        const screenshot = (await page.screenshot()).toString('base64');
        return { result: `Clicked "${selector}" successfully.`, screenshot };
      } catch (e) {
        return { result: `Failed to click "${selector}": ${(e as Error).message}` };
      }
    }

    case 'fill': {
      const selector = input.selector as string;
      const text = input.text as string;
      try {
        await frame.locator(selector).first().fill(text, { timeout: 5000 });
        await page.waitForTimeout(300);
        return { result: `Filled "${selector}" with "${text}".` };
      } catch (e) {
        return { result: `Failed to fill "${selector}": ${(e as Error).message}` };
      }
    }

    case 'screenshot': {
      const screenshot = (await page.screenshot()).toString('base64');
      return { result: 'Screenshot captured.', screenshot };
    }

    case 'get_page_info': {
      try {
        const url = page.url();
        const blockCount = await frame.locator('.class-block').count();
        const activeWeek = await frame.locator('.week-tab.active').textContent() || 'unknown';
        const activeChild = await frame.locator('#childTabs .child-tab.active').textContent() || 'unknown';
        const catCount = await frame.locator('.cat-header').count();
        const visibleItems = await frame.locator('.class-item:visible').count();

        return {
          result: JSON.stringify({
            url,
            classBlocksOnGrid: blockCount,
            activeWeek: activeWeek.trim(),
            activeChild: activeChild.trim(),
            categoryCount: catCount,
            visibleClassItems: visibleItems,
          }, null, 2),
        };
      } catch (e) {
        return { result: `Error getting page info: ${(e as Error).message}` };
      }
    }

    case 'get_console_errors': {
      return {
        result: consoleErrors.length > 0
          ? `Console errors (${consoleErrors.length}):\n${consoleErrors.join('\n')}`
          : 'No console errors.',
      };
    }

    case 'navigate': {
      const path = input.path as string;
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const screenshot = (await page.screenshot()).toString('base64');
      return { result: `Navigated to ${path}.`, screenshot };
    }

    case 'report_bug': {
      const bug: BugReport = {
        title: input.title as string,
        description: input.description as string,
        severity: input.severity as BugReport['severity'],
        steps: input.steps as string[],
      };
      // Take screenshot for the bug report
      try {
        const screenshotBuf = await page.screenshot();
        const path = `test-results/bug-${bugs.length + 1}.png`;
        const fs = await import('fs');
        fs.mkdirSync('test-results', { recursive: true });
        fs.writeFileSync(path, screenshotBuf);
        bug.screenshotPath = path;
      } catch { /* ignore screenshot failures */ }

      bugs.push(bug);
      return { result: `Bug #${bugs.length} reported: "${bug.title}" (${bug.severity})` };
    }

    case 'done': {
      return { result: 'DONE' };
    }

    default:
      return { result: `Unknown tool: ${toolName}` };
  }
}
