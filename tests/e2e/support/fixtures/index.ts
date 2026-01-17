import { mergeTests } from '@playwright/test';
import { test as homeTest } from './home-fixture';

export const test = mergeTests(homeTest);
export { expect } from '@playwright/test';
