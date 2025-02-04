import { expect } from "jsr:@std/expect";
import { describe, it } from "jsr:@std/testing/bdd";
import { FlushableSet } from "./FlushableSet.ts";

describe("onFlush", () => {
  it("should throws on add", () => {
    const set = new FlushableSet<number>(undefined, {
      maxSize: 1,
      onFlush() {
        throw new Error("onFlush");
      },
    });

    set.add(1);
    expect(() => set.add(2)).toThrow();
  });

  it("should rejects on addAsync", async () => {
    const set = new FlushableSet<number>(undefined, {
      maxSize: 1,
      async onFlush() {
        throw new Error("onFlush");
      },
    });

    await set.addAsync(1);
    await expect(set.addAsync(2)).rejects.toMatch(/onFlush/);

    set.add(1);
    set.add(2);
    await expect(set.flushPromise).rejects.toMatch(/onFlush/);
  });
});
