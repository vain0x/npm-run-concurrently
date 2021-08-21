#!/usr/bin/env node

const cp = require("child_process")
const fs = require("fs/promises")

const VERSION = "1.0.0"

const helpText = () => (
  `run-concurrently v${VERSION} <https://github.com/vain0x/npm-run-concurrently>\n`
  + "\n"
  + "EXAMPLE:\n"
  + "    npx run-concurrently build start\n"
  + "\n"
  + "USAGE:\n"
  + "    npx run-concurrently [SCRIPTS...]\n"
)

// Options
let verbose = false
let scripts = []

// -----------------------------------------------
// Logging
// -----------------------------------------------

const trace = (...args) => {
  if (verbose) {
    console.error(...args)
  }
}

// -----------------------------------------------
// Main
// -----------------------------------------------

const readArgs = () => {
  const args = process.argv
  let i = 1

  while (i < args.length) {
    const arg = args[i]
    i++

    switch (arg) {
      case "-h":
      case "--help": {
        process.stdout.write(helpText())
        process.exit(0)
      }
      case "-V":
      case "--version": {
        process.stdout.write(VERSION)
        process.exit(0)
      }
      case "-v":
      case "--verbose": {
        verbose = true
        continue
      }
      default:
        if (arg.endsWith("npm-run-concurrently.js") || arg.endsWith("npm-run-concurrently")) {
          continue
        }

        scripts.push(arg)
        continue
    }
  }

  if (scripts.length === 0) {
    process.stdout.write(helpText())
    process.exit(0)
  }
}

const main = async () => {
  readArgs()

  const manifest = await fs.readFile("package.json", { encoding: "utf-8" }).then(s => JSON.parse(s))

  const invalid = scripts.filter(s => typeof manifest?.scripts?.[s] !== "string")
  if (invalid.length !== 0) {
    throw new Error(`Invalid scripts: ${invalid.join(", ")}.`)
  }

  const subprocessList = []

  const onSignal = signal => {
    trace(`Signaled (${signal})\n`)
    for (const [i, p] of subprocessList.entries()) {
      p?.kill()
      subprocessList[i] = null
    }
    process.kill(process.pid, signal)
  }

  process.once("SIGINT", onSignal)
  process.once("SIGTERM", onSignal)

  const runScript = (script, index) => new Promise((resolve, reject) => {
    const p = cp.spawn("npm", ["run", script], { stdio: "inherit" })
    subprocessList[index] = p

    const label = `${script}#${index}`

    p.on("exit", code => {
      process.stderr.write(`${label}: Exited (${code})\n`)
      subprocessList[p] = null
      resolve(code)
    })

    p.on("error", err => {
      trace(`${label}: Error\n`)
      subprocessList[p] = null
      reject(err)
    })
  })

  await Promise.all(scripts.map(runScript))
}

main().catch(err => {
  console.error(err?.message ?? err)
  process.exit(1)
})
