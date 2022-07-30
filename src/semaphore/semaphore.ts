import { createQueue } from './queue';

export interface Semaphore {
  use<T>(fn: () => Promise<T>): Promise<T>;
  purge(): void;
}

interface SemaphoreTask {
  execute: () => void;
  cancel: (reason: string) => void;
  purged: boolean;
}

export function createSemaphore(name: string, slots: number): Semaphore {
  const queue = createQueue<SemaphoreTask>();

  let availableSlots: number = slots;

  return {
    async use<T>(fn: () => Promise<T>): Promise<T> {
      await acquire();

      try {
        return await fn();
      } finally {
        release();
      }
    },
    purge() {
      let total = 0;
      let task = queue.dequeue();

      while (task !== undefined) {
        total += 1;
        task.purged = true;
        task.cancel('the semaphore (' + name + ') was purged.');

        task = queue.dequeue();
      }

      availableSlots = 0;

      return total;
    },
  };

  async function acquire(): Promise<void> {
    if (availableSlots > 0) {
      availableSlots -= 1;

      return;
    }

    return registerTask();
  }

  function registerTask(): Promise<void> {
    return new Promise((resolve, reject) => {
      queue.enqueue({ execute: resolve, cancel: reject, purged: false });
    });
  }

  function release() {
    availableSlots += 1;
    take();
  }

  function take() {
    if (queue.size === 0 || availableSlots > slots) {
      return;
    }

    const task = queue.dequeue();

    if (task === undefined) {
      return;
    }

    if (task.purged) {
      task.cancel('this task has been purged by semaphore (' + name + ').');
    } else {
      availableSlots -= 1;
      task.execute();
    }
  }
}
