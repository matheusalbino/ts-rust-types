export interface Queue<T> {
  readonly size: number;
  enqueue(data: T): void;
  dequeue(): T | undefined;
  clear(): void;
}

interface Node<T> {
  next: Node<T> | undefined;
  data: T;
}

export function createQueue<T>(): Queue<T> {
  let head: Node<T> | undefined = undefined;
  let tail: Node<T> | undefined = undefined;
  let size = 0;

  return {
    get size() {
      return size;
    },
    enqueue(data: T): void {
      const newNode = createNode(data);

      if (head === undefined) {
        head = newNode;
        tail = newNode;
      } else {
        const node = tail as Node<T>;
        node.next = newNode;
        tail = newNode;
      }

      size += 1;
    },

    dequeue(): T | undefined {
      if (head === undefined) {
        return undefined;
      }

      const node = head;

      head = head.next;

      if (head === undefined) {
        tail = undefined;
      }

      size -= 1;

      return node.data;
    },

    clear(): void {
      size = 0;
      head = undefined;
      tail = undefined;
    },
  };
}

function createNode<T>(data: T): Node<T> {
  return { next: undefined, data };
}
