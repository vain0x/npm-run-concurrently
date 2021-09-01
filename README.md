# run-concurrently

Runs `npm` scripts concurrently.

One of concepts is "no configuration" and "zero dependencies."
Use `currently` or `npm-run-all` for more features.

## Use with npx

```sh
npx run-concurrently build start
```

## Install from npm

```sh
npm install -g run-concurrently
```

And then use:

```sh
npm-run-concurrently build start
```

----

## Appendix

### Why isn't output colored?

Some command prints colored output only in some condition.
Check if your command can be configured with something
such as `--color` option or `FORCE_COLOR=1` environment variable.
Search for tty/`isatty` for detailed information.

## Verbose output

With `--verbose`, it prints exit code of subprocess and caught signal.
