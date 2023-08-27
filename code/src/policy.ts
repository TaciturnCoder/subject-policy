import { ProxyTrap, Contract } from "../symbols.js";
import {
  Observer, Watcher, Subject,
  Interface as IntInt, Policy as PolicyInt
} from "../types.js";
import { Interface } from "./interface.js";

declare type Key = PropertyKey;

/**
 * Policy: Proxy handler that implements the Subject-Policy interface.
 */
export class Policy implements PolicyInt {
  #Trap: symbol;

  readonly #target: any;
  readonly #interface: IntInt;
  /**
   * subject: Object that is being observed.
   */
  public readonly subject: Subject;

  readonly #bubble?: PolicyInt;
  /**
   * observers: set of observers.
   */
  public readonly observers: Set<Observer>;
  /**
   * watchers: map of watchers by key.
   */
  public readonly watchers: Map<Key, Set<Watcher>>;

  constructor(target: any, bubble?: PolicyInt, trap?: symbol) {
    this.#Trap = trap ?? Symbol("ProxyTrap:internal")

    this.#target = target;
    this.#interface = new Interface(this);
    this.subject = new Proxy(target, this);

    this.#bubble = bubble;
    this.observers = new Set();
    this.watchers = new Map();
  }

  /**
   * Proxy Handlers - has: check if a property exists.
   */
  public has(target: any, key: Key): boolean {
    return key === this.#Trap || key === Contract || Reflect.has(target, key);
  }

  /**
   * Proxy Handlers - get: get a property value.
   * If the property is an object, it is wrapped in a nested policy.
   * If the property is Contract, the subject-policy interface is returned.
   */
  public get(target: any, key: Key, receiver: any): any {
    if (key === this.#Trap) {
      return true;
    }
    if (key === Contract) {
      return this.#interface;
    }

    let value = Reflect.get(target, key, receiver);
    // Lazy initialization of nested subject-policy.
    if (
      typeof value === 'object' && value !== null &&
      !(this.#Trap in value || ProxyTrap in value)
    ) {
      value = new Policy(value, this, this.#Trap).subject;
      Reflect.set(target, key, value, receiver);
      return value;
    }

    return value;
  }

  /**
   * Proxy Handlers - set: set a property value.
   */
  public set(target: any, key: Key, value: any, receiver: any): boolean {
    if (key === this.#Trap) {
      return false;
    }
    if (key === Contract) {
      return false;
    }

    const data = Reflect.get(target, key, receiver);
    if (data !== value) {
      const status = Reflect.set(target, key, value, receiver);
      this.dispatch(this.subject, key, value);
      return status;
    }
    return true;
  }

  /**
   * Proxy Handlers - deleteProperty: delete a property.
   */
  public deleteProperty(target: any, key: Key): boolean {
    if (key === this.#Trap) {
      return false;
    }
    if (key === Contract) {
      return false;
    }

    // NOTE: undefined is used to indicate deletion.
    const status = Reflect.deleteProperty(target, key);
    this.dispatch(this.subject, key, undefined);
    return status;
  }

  /**
   * Interface Handlers - dispatch: dispatch a change to observers and watchers.
   * Watchers are called first and only if event is not bubbled.
   * If a bubble policy is set, the change is dispatched to it as well.
   */
  public async dispatch(subject: Subject, key: Key, data: any): Promise<void> {
    if (subject === this.subject) {
      const watchers = this.watchers.get(key);
      if (watchers !== undefined) {
        for (const watcher of watchers) {
          watcher(data);
        }
      } // else: no watchers for this key.
    } // else: bubbled event, do not call watchers.

    for (const observer of this.observers) {
      observer(subject, key, data);
    }

    if (this.#bubble !== undefined) {
      await this.#bubble.dispatch(subject, key, data);
    } // else: no bubble policy.
  }
}
