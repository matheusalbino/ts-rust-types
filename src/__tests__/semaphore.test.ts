import { createSemaphore, type Semaphore } from '../';

describe('Semaphore', function () {
  test('slots (1)', async function () {
    const semaphore = createSemaphore('1-slot', 1);
    const executor = jest.fn(() => sleep(500));
    const success = jest.fn(() => undefined);
    const failure = jest.fn(() => undefined);

    const elapsedTime = await prepare({ tasks: 2, semaphore, executor, success, failure });

    expect(inRange(elapsedTime, 1000, 1010)).toBeTruthy();
    expect(success).toBeCalledTimes(2);
    expect(failure).toBeCalledTimes(0);
  });

  test('slots (2)', async function () {
    const semaphore = createSemaphore('2-slots', 2);
    const executor = jest.fn(() => sleep(500));
    const success = jest.fn(() => undefined);
    const failure = jest.fn(() => undefined);

    const elapsedTime = await prepare({ tasks: 2, semaphore, executor, success, failure });

    expect(inRange(elapsedTime, 500, 510)).toBeTruthy();
    expect(success).toBeCalledTimes(2);
    expect(failure).toBeCalledTimes(0);
  });

  test('purge', async function () {
    const semaphore = createSemaphore('IO', 1);

    const executor = jest.fn(() => sleep(500));
    const success = jest.fn(() => undefined);
    const failure = jest.fn(() => undefined);

    const process = prepare({ tasks: 10, semaphore, executor, success, failure });

    semaphore.purge();

    const elapsedTime = await process;

    expect(inRange(elapsedTime, 500, 510)).toBeTruthy();
    expect(success).toBeCalledTimes(1);
    expect(failure).toBeCalledTimes(9);
    expect(failure).toBeCalledWith('the semaphore (IO) was purged.');
  });
});

async function prepare(options: {
  tasks: number;
  semaphore: Semaphore;
  executor: jest.Mock<Promise<unknown>, []>;
  success: jest.Mock<void, []>;
  failure: jest.Mock<void, []>;
}): Promise<number> {
  const { semaphore, tasks: numberOfTasks, executor, success, failure } = options;
  const tasks = [];

  const startTime = Date.now();

  for (let i = 0; i < numberOfTasks; i++) {
    tasks.push(semaphore.use(executor).then(success, failure));
  }

  await Promise.all(tasks);
  const elapsedTime = Math.round(Date.now() - startTime);

  return elapsedTime;
}

function sleep(ms: number): Promise<void> {
  return new Promise((done) => setTimeout(done, ms));
}

function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
