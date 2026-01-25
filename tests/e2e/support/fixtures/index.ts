import { mergeTests } from '@playwright/test';
import { test as homeTest } from './home-fixture';
import { test as playerTest } from './player-fixture';
import { test as lobbyTest } from './lobby-fixture';

export const test = mergeTests(homeTest, playerTest, lobbyTest);
export { expect } from '@playwright/test';
