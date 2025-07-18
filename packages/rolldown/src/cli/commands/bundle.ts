import colors from 'ansis';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { onExit } from 'signal-exit';
import { version } from '../../../package.json';
import type { ConfigExport, RolldownOutput } from '../..';
import { rolldown } from '../../api/rolldown';
import { watch as rolldownWatch } from '../../api/watch';
import { loadConfig } from '../../utils/load-config';
import { arraify } from '../../utils/misc';
import type { NormalizedCliOptions } from '../arguments/normalize';
import { logger } from '../logger';

export async function bundleWithConfig(
  configPath: string,
  cliOptions: NormalizedCliOptions,
): Promise<void> {
  if (cliOptions.watch) {
    process.env.ROLLUP_WATCH = 'true';
    process.env.ROLLDOWN_WATCH = 'true';
  }

  const config = await loadConfig(configPath);

  if (!config) {
    logger.error(`No configuration found at ${config}`);
    process.exit(1);
  }

  // TODO: Could add more validation/diagnostics here to emit a nice error message
  if (cliOptions.watch) {
    await watchInner(config, cliOptions);
  } else {
    await bundleInner(config, cliOptions);
  }
}

export async function bundleWithCliOptions(
  cliOptions: NormalizedCliOptions,
): Promise<void> {
  if (cliOptions.output.dir || cliOptions.output.file) {
    const operation = cliOptions.watch ? watchInner : bundleInner;
    await operation({}, cliOptions);
    return;
  }

  if (cliOptions.watch) {
    logger.error('You must specify `output.dir` to use watch mode');
    process.exit(1);
  }

  await using build = await rolldown(cliOptions.input);

  const { output: outputs } = await build.generate(cliOptions.output);

  if (outputs.length === 0) {
    logger.error('No output generated');
    process.exit(1);
  }

  for (const file of outputs) {
    if (outputs.length > 1) {
      logger.log(`\n${colors.cyan(colors.bold(`|→ ${file.fileName}:`))}\n`);
    }
    // avoid consola since it doesn't print it as raw string
    // eslint-disable-next-line no-console
    console.log(file.type === 'asset' ? file.source : file.code);
  }
}

async function watchInner(
  config: ConfigExport,
  cliOptions: NormalizedCliOptions,
) {
  // Only if watch is true in CLI can we use watch mode.
  // We should not make it `await`, as it never ends.

  let normalizedConfig = arraify(config).map((option) => {
    return {
      ...option,
      ...cliOptions.input,
      output: arraify(option.output || {}).map((output) => {
        return {
          ...output,
          ...cliOptions.output,
        };
      }),
    };
  });
  const watcher = await rolldownWatch(normalizedConfig);

  onExit((code: number | null | undefined) => {
    Promise.resolve(watcher.close()).finally(() => {
      process.exit(typeof code === 'number' ? code : 0);
    });
    return true;
  });

  const changedFile: string[] = [];
  watcher.on('change', (id, event) => {
    if (event.event === 'update') {
      changedFile.push(id);
    }
  });
  watcher.on('event', async (event) => {
    switch (event.code) {
      case 'BUNDLE_START':
        if (changedFile.length > 0) {
          logger.log(
            `Found ${
              colors.bold(changedFile.map(relativeId).join(', '))
            } changed, rebuilding...`,
          );
        }
        changedFile.length = 0;
        break;

      case 'BUNDLE_END':
        await event.result.close();
        logger.success(
          `Rebuilt ${colors.bold(relativeId(event.output[0]))} in ${
            colors.green(ms(event.duration))
          }.`,
        );
        break;

      case 'ERROR':
        await event.result.close();
        logger.error(event.error);
        break;

      default:
        break;
    }
  });

  logger.log(`Waiting for changes...`);
}

async function bundleInner(
  config: ConfigExport,
  cliOptions: NormalizedCliOptions,
) {
  const startTime = performance.now();

  const result = [];

  const configList = arraify(config);
  for (const config of configList) {
    const outputList = arraify(config.output || {});
    const build = await rolldown({ ...config, ...cliOptions.input });
    for (const output of outputList) {
      // run multiply instance at sequential
      try {
        result.push(
          await build.write({
            ...output,
            ...cliOptions.output,
          }),
        );
      } finally {
        await build.close();
      }
    }
  }

  result.forEach(printBundleOutputPretty);
  logger.log(``);

  const endTime = performance.now();
  const duration = endTime - startTime;
  // If the build time is more than 1s, we should display it in seconds.

  logger.success(
    `rolldown v${version} Finished in ${colors.green(ms(duration))}`,
  );
}

function printBundleOutputPretty(output: RolldownOutput) {
  const outputEntries = collectOutputEntries(output.output);
  const outputLayoutSizes = collectOutputLayoutAdjustmentSizes(outputEntries);
  printOutputEntries(outputEntries, outputLayoutSizes, '<DIR>');
}

type ChunkType = 'chunk' | 'asset';
type OutputEntry = {
  type: ChunkType;
  fileName: string;
  size: number;
};

function collectOutputEntries(output: RolldownOutput['output']): OutputEntry[] {
  return output.map((chunk) => ({
    type: chunk.type,
    fileName: chunk.fileName,
    size: chunk.type === 'chunk'
      ? Buffer.byteLength(chunk.code)
      : Buffer.byteLength(chunk.source),
  }));
}

function collectOutputLayoutAdjustmentSizes(entries: OutputEntry[]) {
  let longest = 0;
  let biggestSize = 0;
  for (const entry of entries) {
    if (entry.fileName.length > longest) {
      longest = entry.fileName.length;
    }
    if (entry.size > biggestSize) {
      biggestSize = entry.size;
    }
  }

  const sizePad = displaySize(biggestSize).length;

  return {
    longest,
    biggestSize,
    sizePad,
  };
}

const numberFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function displaySize(bytes: number) {
  return `${numberFormatter.format(bytes / 1000)} kB`;
}

const CHUNK_GROUPS = [
  { type: 'asset', color: 'green' },
  { type: 'chunk', color: 'cyan' },
] satisfies { type: ChunkType; color: keyof typeof colors }[];

function printOutputEntries(
  entries: OutputEntry[],
  sizeAdjustment: ReturnType<typeof collectOutputLayoutAdjustmentSizes>,
  distPath: string,
) {
  for (const group of CHUNK_GROUPS) {
    const filtered = entries.filter((e) => e.type === group.type);
    if (!filtered.length) {
      continue;
    }
    for (const entry of filtered.sort((a, z) => a.size - z.size)) {
      // output format: `path/to/xxx type | size: y.yy kB`
      let log = colors.dim(withTrailingSlash(distPath));
      log += colors[group.color](
        entry.fileName.padEnd(sizeAdjustment.longest + 2),
      );
      log += colors.dim(entry.type);
      log += colors.dim(
        ` │ size: ${displaySize(entry.size).padStart(sizeAdjustment.sizePad)}`,
      );
      logger.log(log);
    }
  }
}

function withTrailingSlash(path: string): string {
  if (path[path.length - 1] !== '/') {
    return `${path}/`;
  }
  return path;
}

function ms(duration: number) {
  return duration < 1000
    ? `${duration.toFixed(2)} ms`
    : `${(duration / 1000).toFixed(2)} s`;
}

function relativeId(id: string): string {
  if (!path.isAbsolute(id)) return id;
  return path.relative(path.resolve(), id);
}
