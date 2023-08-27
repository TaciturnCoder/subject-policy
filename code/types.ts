import { ProxyTrap, Contract } from "./symbols.js";

declare type Key = PropertyKey;

/**
 * Observer: function called when a subject is manipulated.
 * Observers obserevr for changes to any property or nested property.
 */
export type Observer = (subject: Subject, key: Key, data: any) => void;

/**
 * Watcher: function called when a subject's watched property is manipulated.
 * Watchers watch for changes to a specific property at same level.
 */
export type Watcher = (data: any) => void;

/**
 * Subject: Object that can be observed.
 */
export interface Subject {
  [ProxyTrap]: boolean;
  [Contract]: Interface;
  [key: Key]: any;
}

/**
 * Interface: Subject-Policy interface.
 * Provides methods to add and remove observers and watchers.
 */
export interface Interface {
  addObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  addWatcher(key: Key, watcher: Watcher): void;
  removeWatcher(key: Key, watcher: Watcher): void;
}

/**
 * Policy: Proxy handler that implements the Subject-Policy interface.
 */
export interface Policy extends ProxyHandler<any> {
  // Proxy Handlers
  has(target: any, key: Key): boolean;
  get(target: any, key: Key, receiver: any): any;
  set(target: any, key: Key, value: any, receiver: any): boolean;
  deleteProperty(target: any, key: Key): boolean;

  // Interface Handlers
  subject: Subject;
  observers: Set<Observer>;
  watchers: Map<Key, Set<Watcher>>;
  dispatch(subject: Subject, key: Key, data: any): Promise<void>;
}
