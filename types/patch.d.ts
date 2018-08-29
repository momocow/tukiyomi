///<reference path="../node_modules/vm2/index.d.ts" />

declare module "vm2" {
  interface NodeVMOptions { }

  interface VMScript { }

  // fix NodeVM type should extend EventEmitter API
  // the latest version of definition from VM2 Github is correct but has not been released.
  class NodeVM extends NodeJS.EventEmitter {
    constructor(options?: NodeVMOptions);
    run(js: string, path: string): any;
    run(script: VMScript, path?: string): any;
    freeze(object: any, name: string): any;
    protect(object: any, name: string): any;
    require(module: string): any;
    on(event: "console.log", listener: (msg: string, ...args: any[]) => void): this;
    on(event: "console.debug", listener: (msg: string, ...args: any[]) => void): this;
    on(event: "console.info", listener: (msg: string, ...args: any[]) => void): this;
    on(event: "console.warn", listener: (msg: string, ...args: any[]) => void): this;
    on(event: "console.error", listener: (msg: string, ...args: any[]) => void): this;
    on(event: "console.trace", listener: (msg: string, ...args: any[]) => void): this;
  }
}
