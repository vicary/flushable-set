/** Invoked when `.flush()` is called manually or via maxSize. */
export type FlushCallback<T> = (
  /** Reference for normal functions */
  this: FlushableSet<T>,
  /** Reference for arrow functions */
  that: FlushableSet<T>,
) => Promise<void> | void;

/** Constructor options for FlushableSet. */
export type FlushableSetOptions<T> = {
  /** Maximum size allowed before an auto-flush is triggered. */
  maxSize?: number;

  /** Invoked when `.flush()` is called manually or via maxSize. */
  onFlush?: FlushCallback<T>;
};

/**
 * A drop-in replacement of the native Set with an optional
 * flush callback, alongside an optional max size that triggers it.
 *
 * ```ts
 * const chunk = new FlushableSet(null, {
 *   maxSize: 10,
 *   async onFlush() {
 *     await db.insertMany(Array.from(this));
 *   }
 * });
 *
 * await chunk.addAsync(data);
 * ```
 *
 * Promise mutex is implemented in `.add()` and `.addAsync()` to prevent
 * racing conditions.
 *
 * 1. `.add()` throws when an asynchronous flush is in progress.
 * 2. `.addAsync()` await until the flush is done before adding the value.
 */
export class FlushableSet<
  // deno-lint-ignore no-explicit-any
  T = any,
> extends Set<T> {
  #maxSize = Infinity;

  /**
   * Maximum size allowed before an auto-flush is triggered.
   *
   * @default Infinity
   */
  get maxSize(): number {
    return this.#maxSize;
  }

  #onFlush?: FlushCallback<T>;

  #flushPromise?: Promise<void>;

  /**
   * A reference to the current flush action if the specified onFlush callback
   * is asynchronous.
   */
  get flushPromise(): Promise<void> | undefined {
    return this.#flushPromise;
  }

  constructor(
    iterable?: Iterable<T> | null,
    { maxSize = Infinity, onFlush }: FlushableSetOptions<T> = {},
  ) {
    if (maxSize < 1) {
      throw new Error(`maxSize must be greater than 0.`);
    }

    super(iterable);

    this.#maxSize = maxSize;

    this.#onFlush = onFlush;
  }

  override add(value: T): this {
    if (this.#flushPromise) {
      throw new Error(
        `An asynchronous flush is in progress, please wait for it to finish before adding more values.`,
      );
    }

    if (this.size >= this.#maxSize) {
      this.flush();
    }

    this.flushPromise
      ?.finally(() => super.add(value)) ??
      super.add(value);

    return this;
  }

  /**
   * Appends a new element with a specified value to the end of the Set.
   *
   * If the addition triggers a flush, this method waits for the flush to
   * finish.
   *
   * If there is an ongoing flush, this method waits for it to finish before
   * adding the value.
   */
  async addAsync(value: T): Promise<this> {
    await this.#flushPromise;

    this.add(value);

    await this.#flushPromise;

    return this;
  }

  /**
   * Triggers the onFlush callback if specified, clears the set afterwards.
   */
  flush(): Promise<void> | void {
    const res = this.#onFlush?.call(this, this);

    if (res instanceof Promise) {
      this.#flushPromise = res.finally(() => {
        this.clear();
        this.#flushPromise = undefined;
      });

      return res;
    }

    this.clear();
  }
}
