import { Observer, Watcher, Policy, Interface as IntInt } from "../types.js";

/**
 * Interface: Subject-Policy interface provider.
 * Provides methods to add and remove observers and watchers.
 */
export class Interface implements IntInt {
  readonly #policy: Policy;

  constructor(policy: Policy) {
    this.#policy = policy;
  }

  /**
   * addObserver: add an observer to the policy.
   */
  public addObserver(observer: Observer): void {
    this.#policy.observers.add(observer);
  }

  /**
   * removeObserver: remove an observer from the policy.
   */
  public removeObserver(observer: Observer): void {
    this.#policy.observers.delete(observer);
  }

  /**
   * addWatcher: add a watcher to the policy.
   */
  public addWatcher(key: PropertyKey, watcher: Watcher): void {
    let watchers = this.#policy.watchers.get(key);
    if (watchers === undefined) {
      watchers = new Set();
      this.#policy.watchers.set(key, watchers);
    }
    watchers.add(watcher);
  }

  /**
   * removeWatcher: remove a watcher from the policy.
   */
  public removeWatcher(key: PropertyKey, watcher: Watcher): void {
    const watchers = this.#policy.watchers.get(key);
    if (watchers !== undefined) {
      watchers.delete(watcher);
    }
  }
}
