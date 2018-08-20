class Stdout {
  println (text) {
    this.print(text + '\n')
  }

  print (text) {
    process.stdout.write(text)
  }
}

class Stderr {
  println (text) {
    this.print(text+ '\n')
  }

  print (text) {
    process.stderr.write(text)
  }
}

module.exports = {
  Stdout, Stderr
}
