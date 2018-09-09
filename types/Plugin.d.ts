declare namespace TukiYomi {
  interface Env {
    DATA_DIR: string
  }

  interface TukiYomiPluginOptions {
    default?: {[string: string]: any}
  }
}
