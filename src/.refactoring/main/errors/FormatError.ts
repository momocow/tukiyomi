export default class FormatError extends Error {
  constructor (context: string) {
    super(`Invalid format: ${context}`)
    this.name = 'FormatError'
  }
}
