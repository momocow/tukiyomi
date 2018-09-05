declare namespace TukiYomi {
  interface Env {
    DATA_DIR: string
  }

  namespace Plugin {
    type PluginScope = "dom" |
      "dom.host" |
      "dom.game" |
      "fs" |
      "fs.read" |
      "fs.write" |
      "process" |
      "child_process" |
      "child_process.exec" |
      "child_process.execFile" |
      "child_process.spawn" |
      "child_process.fork"

    interface PluginOptions {
      default?: {[string: string]: any}
    }
  }
}
