declare module "vm2" {

  /**
   *  Require options for a VM
   */
  interface VMRequire {
    /** Array of allowed builtin modules, accepts ["*"] for all (default: none) */
    builtin?: string[];
    /*
     * `host` (default) to require modules in host and proxy them to sandbox. `sandbox` to load, compile and 
     * require modules in sandbox. Builtin modules except `events` always required in host and proxied to sandbox 
     */
    context?: "host" | "sandbox";
    /** `true` or an array of allowed external modules (default: `false`) */
    external?: boolean | string[];
    /** Array of modules to be loaded into NodeVM on start. */
    import?: string[];
    /** Restricted path where local modules can be required (default: every path). */
    root?: string;
    /** Collection of mock modules (both external or builtin). */
    mock?: any;
  }
  
  /**
   * A custom compiler function for all of the JS that comes
   * into the VM
   */
  type CompilerFunction = (code: string, filename: string) => string;
  
  /**
   *  Options for creating a NodeVM
   */
  interface VMOptions {
    /** 
     * `javascript` (default) or `coffeescript` or custom compiler function (which receives the code, and it's filepath).
     *  The library expects you to have coffee-script pre-installed if the compiler is set to `coffeescript`. 
     */
    compiler?: "javascript" | "coffeescript" | CompilerFunction;
    /** VM's global object. */
    sandbox?: any;
    /**
     * Script timeout in milliseconds.  Timeout is only effective on code you run through `run`. 
     * Timeout is NOT effective on any method returned by VM.
     */
    timeout?: number;
  
    /** File extensions that the internal module resolver should accept. */
    sourceExtensions?: string[]
  }
  
  /**
   *  Options specific o 
   */
  interface NodeVMOptions extends VMOptions {
    /** `inherit` to enable console, `redirect` to redirect to events, `off` to disable console (default: `inherit`). */
    console?: "inherit" | "redirect";
    /** `true` or an object to enable `require` optionss (default: `false`). */
    require?: true | VMRequire;
    /** `true` to enable VMs nesting (default: `false`). */
    nesting?: boolean;
    /** `commonjs` (default) to wrap script into CommonJS wrapper, `none` to retrieve value returned by the script. */
    wrapper?: "commonjs" | "none";
  }
  
  /**
   * A VM with behavior more similar to running inside Node.
   */
  class NodeVM extends NodeJS.EventEmitter {
    constructor(options?: NodeVMOptions);
    /** Runs the code */
    run(js: string, path: string): any;
    /** Runs the VMScript object */
    run(script: VMScript, path?: string): any;
  
    /** Freezes the object inside VM making it read-only. Not available for primitive values. */
    freeze(object: any, name: string): any;
    /** Protects the object inside VM making impossible to set functions as it's properties. Not available for primitive values. */
    protect(object: any, name: string): any;
    /** Require a module in VM and return it's exports. */
    require(module: string): any;
  }
  
  /**
   * VM is a simple sandbox, without `require` feature, to synchronously run an untrusted code. 
   * Only JavaScript built-in objects + Buffer are available. Scheduling functions 
   * (`setInterval`, `setTimeout` and `setImmediate`) are not available by default.
   */
  class VM {
    constructor(options?: VMOptions);
    /** Runs the code */
    run(js: string): any;
    /** Runs the VMScript object */
    run(script: VMScript): any;
    /** Freezes the object inside VM making it read-only. Not available for primitive values. */
    freeze(object: any, name: string): any;
    /** Protects the object inside VM making impossible to set functions as it's properties. Not available for primitive values */
    protect(object: any, name: string): any;
  
    /**
     * Create NodeVM and run code inside it.
     *
     * @param {String} script Javascript code.
     * @param {String} [filename] File name (used in stack traces only).
     * @param {Object} [options] VM options.
     */
    static code(script: string, filename: string, options: NodeVMOptions): NodeVM;
  
    /**
     * Create NodeVM and run script from file inside it.
     *
     * @param {String} [filename] File name (used in stack traces only).
     * @param {Object} [options] VM options.
     */
    static file(filename: string, options: NodeVMOptions): NodeVM
  }
  
  /**
   * You can increase performance by using pre-compiled scripts. 
   * The pre-compiled VMScript can be run later multiple times. It is important to note that the code is not bound
   * to any VM (context); rather, it is bound before each run, just for that run.
   */
  class VMScript {
    constructor(code: string, path?: string);
    /** Wraps the code */
    wrap(prefix: string, postfix: string): VMScript;
    /** Compiles the code. If called multiple times, the code is only compiled once. */
    compile(): any;
  }
  
  /** Custom Error class */
  class VMError extends Error {}
}

declare module "@iarna/toml" {
  interface FuncParse {
    (toml: string): object
    async: (toml: string, options: { blocksize: number }) => Promise<object>
    stream: (readable: NodeJS.ReadableStream) => Promise<object>
  }

  export const parse: FuncParse
  export function stringify (obj: object): string
}

declare module 'electron-window-state' {
  function module(opts: Options): State

  export type Options = Partial<{
    defaultWidth: number
  
    // The width that should be returned if no file exists yet. Defaults to 800.
    defaultHeight: number
  
    // The height that should be returned if no file exists yet. Defaults to 600.
    path: string
  
    // The path where the state file should be written to. Defaults to app.getPath('userData')
    file: string
  
    // The name of file. Defaults to window-state.json
    maximize: boolean
  
    // Should we automatically maximize the window, if it was last closed maximized. Defaults to true
    fullScreen: boolean
  }>
  
  export type State = {
    x: number
  
    // The saved x coordinate of the loaded state. undefined if the state has not been saved yet.
    y: number
  
    // The saved y coordinate of the loaded state. undefined if the state has not been saved yet.
    width: number
  
    // The saved width of loaded state. defaultWidth if the state has not been saved yet.
    height: number
  
    // The saved heigth of loaded state. defaultHeight if the state has not been saved yet.
    isMaximized: boolean
  
    // true if the window state was saved while the window was maximized. undefined if the state has not been saved yet.
    isFullScreen: boolean
  
    // true if the window state was saved while the window was in full screen mode. undefined if the state has not been saved yet.
    manage: (window: Electron.BrowserWindow) => void
  
    // Register listeners on the given BrowserWindow for events that are related to size or position changes (resize, move). It will also restore the window's maximized or full screen state. When the window is closed we automatically remove the listeners and save the state.
    unmanage: () => void
  
    // Removes all listeners of the managed BrowserWindow in case it does not need to be managed anymore.
    saveState: (window: Electron.BrowserWindow) => void
  
    // Saves the current state of the given BrowserWindow. This exists mostly for legacy purposes, and in most cases it's better to just use manage.
  }

  export default module
}