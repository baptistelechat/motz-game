import { mergeTests } from '@playwright/test';
import { test as homeTest } from './home-fixture';
import { test as playerTest } from './player-fixture';

export const test = mergeTests(homeTest, playerTest);
export { expect } from '@playwright/test';
