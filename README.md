# FlushableSet

A drop-in replacement of the native Set with an optional max size and a flush
callback.

## Installation

```bash
# deno
deno add @vicary/flushable-set

# npm
npx jsr add @vicary/flushable-set

# yarn
yarn dlx jsr add @vicary/flushable-set

# pnpm
pnpm dlx jsr add @vicary/flushable-set
```

## Usage

```typescript
import { FlushableSet } from "@vicary/flushable-set";

const set = new FlushableSet(null, {
  maxSize: 3,
  onFlush() {
    console.log("Flushing items", Array.from(this));
  },
});

for (let i = 0; i < 10; i++) {
  set.add(i);
}

// Flushing items [0, 1, 2]
// Flushing items [3, 4, 5]
// Flushing items [6, 7, 8]
// Flushing items [9]
```

Asynchronous flush is supported with promise mutex, this comes in handy for
database insertion from an external stream.

```typescript
const chunk = new FlushableSet(null, {
  maxSize: 100,
  async onFlush() {
    await db.insertMany(Array.from(this));
  },
});

for await (const row of dataStream) {
  // Automatically flushes to database for every 100 rows
  await chunk.addAsync(row);
}

// Flush the remaining items
await chunk.flush();
```
