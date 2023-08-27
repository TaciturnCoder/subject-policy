import {
  ProxyTrap, Contract, Subject, Policy
} from "../build/index.js";

declare type Key = PropertyKey;
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class App {
  public name: string;
  public user?: User;
  public pages: string[];

  constructor(page: string) {
    this.name = page;
    this.user = undefined;
    this.pages = [];
  }

  public async login(name: string, age: number) {
    this.user = new User(name, age);
  };

  public async logout() {
    this.user = undefined;
  }
}

class User {
  public readonly name: string;
  public readonly age: number;
  [ProxyTrap]: boolean = true;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

// Setup
const App1 = new Policy(new App("Facebook")).subject;
const App2 = new Policy(new App("Instagram")).subject;
const logs: any[] = [];

// Contracts
const App1Contract = App1[Contract];
const App2Contract = App2[Contract];

App1Contract.addObserver((subject: Subject, key: Key, data: any) => {
  logs.push({
    observer: "App1",
    subject: subject,
    key: key,
    data: data
  })
});

App2Contract.addObserver((subject: Subject, key: Key, data: any) => {
  logs.push({
    observer: "App2",
    subject: subject,
    key: key,
    data: data
  })
});

App1Contract.addWatcher("user", (data: any) => {
  logs.push({
    watcher: "App1.user",
    data: data
  });
});

// Tests
App1.login("Taciturn Coder", 100);
App2.user = App1.user;
App1.pages.push("Home");
App2.pages = App1.pages;
App1.pages.push("Profile");
App2.pages.push("Contact"); // This should trigger both observers.
App2.user.age = 80; // This should not trigger a dispatch.
App2.logout();

// Results
sleep(1000).then(() => {
  console.log(logs);
});
