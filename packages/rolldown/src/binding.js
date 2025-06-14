// prettier-ignore
/* eslint-disable */
// @ts-nocheck
/* auto-generated by NAPI-RS */

const { createRequire } = require('node:module')
require = createRequire(__filename)

const { readFileSync } = require('node:fs')
let nativeBinding = null
const loadErrors = []

const isMusl = () => {
  let musl = false
  if (process.platform === 'linux') {
    musl = isMuslFromFilesystem()
    if (musl === null) {
      musl = isMuslFromReport()
    }
    if (musl === null) {
      musl = isMuslFromChildProcess()
    }
  }
  return musl
}

const isFileMusl = (f) => f.includes('libc.musl-') || f.includes('ld-musl-')

const isMuslFromFilesystem = () => {
  try {
    return readFileSync('/usr/bin/ldd', 'utf-8').includes('musl')
  } catch {
    return null
  }
}

const isMuslFromReport = () => {
  let report = null
  if (typeof process.report?.getReport === 'function') {
    process.report.excludeNetwork = true
    report = process.report.getReport()
  }
  if (!report) {
    return null
  }
  if (report.header && report.header.glibcVersionRuntime) {
    return false
  }
  if (Array.isArray(report.sharedObjects)) {
    if (report.sharedObjects.some(isFileMusl)) {
      return true
    }
  }
  return false
}

const isMuslFromChildProcess = () => {
  try {
    return require('child_process').execSync('ldd --version', { encoding: 'utf8' }).includes('musl')
  } catch (e) {
    // If we reach this case, we don't know if the system is musl or not, so is better to just fallback to false
    return false
  }
}

function requireNative() {
  if (process.env.NAPI_RS_NATIVE_LIBRARY_PATH) {
    try {
      nativeBinding = require(process.env.NAPI_RS_NATIVE_LIBRARY_PATH);
    } catch (err) {
      loadErrors.push(err)
    }
  } else if (process.platform === 'android') {
    if (process.arch === 'arm64') {
      try {
        return require('./rolldown-binding.android-arm64.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-android-arm64')
      } catch (e) {
        loadErrors.push(e)
      }

    } else if (process.arch === 'arm') {
      try {
        return require('./rolldown-binding.android-arm-eabi.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-android-arm-eabi')
      } catch (e) {
        loadErrors.push(e)
      }

    } else {
      loadErrors.push(new Error(`Unsupported architecture on Android ${process.arch}`))
    }
  } else if (process.platform === 'win32') {
    if (process.arch === 'x64') {
      try {
        return require('./rolldown-binding.win32-x64-msvc.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-win32-x64-msvc')
      } catch (e) {
        loadErrors.push(e)
      }

    } else if (process.arch === 'ia32') {
      try {
        return require('./rolldown-binding.win32-ia32-msvc.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-win32-ia32-msvc')
      } catch (e) {
        loadErrors.push(e)
      }

    } else if (process.arch === 'arm64') {
      try {
        return require('./rolldown-binding.win32-arm64-msvc.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-win32-arm64-msvc')
      } catch (e) {
        loadErrors.push(e)
      }

    } else {
      loadErrors.push(new Error(`Unsupported architecture on Windows: ${process.arch}`))
    }
  } else if (process.platform === 'darwin') {
    try {
        return require('./rolldown-binding.darwin-universal.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-darwin-universal')
      } catch (e) {
        loadErrors.push(e)
      }

    if (process.arch === 'x64') {
      try {
        return require('./rolldown-binding.darwin-x64.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-darwin-x64')
      } catch (e) {
        loadErrors.push(e)
      }

    } else if (process.arch === 'arm64') {
      try {
        return require('./rolldown-binding.darwin-arm64.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-darwin-arm64')
      } catch (e) {
        loadErrors.push(e)
      }

    } else {
      loadErrors.push(new Error(`Unsupported architecture on macOS: ${process.arch}`))
    }
  } else if (process.platform === 'freebsd') {
    if (process.arch === 'x64') {
      try {
        return require('./rolldown-binding.freebsd-x64.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-freebsd-x64')
      } catch (e) {
        loadErrors.push(e)
      }

    } else if (process.arch === 'arm64') {
      try {
        return require('./rolldown-binding.freebsd-arm64.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-freebsd-arm64')
      } catch (e) {
        loadErrors.push(e)
      }

    } else {
      loadErrors.push(new Error(`Unsupported architecture on FreeBSD: ${process.arch}`))
    }
  } else if (process.platform === 'linux') {
    if (process.arch === 'x64') {
      if (isMusl()) {
        try {
        return require('./rolldown-binding.linux-x64-musl.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-linux-x64-musl')
      } catch (e) {
        loadErrors.push(e)
      }

      } else {
        try {
        return require('./rolldown-binding.linux-x64-gnu.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-linux-x64-gnu')
      } catch (e) {
        loadErrors.push(e)
      }

      }
    } else if (process.arch === 'arm64') {
      if (isMusl()) {
        try {
        return require('./rolldown-binding.linux-arm64-musl.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-linux-arm64-musl')
      } catch (e) {
        loadErrors.push(e)
      }

      } else {
        try {
        return require('./rolldown-binding.linux-arm64-gnu.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-linux-arm64-gnu')
      } catch (e) {
        loadErrors.push(e)
      }

      }
    } else if (process.arch === 'arm') {
      if (isMusl()) {
        try {
        return require('./rolldown-binding.linux-arm-musleabihf.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-linux-arm-musleabihf')
      } catch (e) {
        loadErrors.push(e)
      }

      } else {
        try {
        return require('./rolldown-binding.linux-arm-gnueabihf.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-linux-arm-gnueabihf')
      } catch (e) {
        loadErrors.push(e)
      }

      }
    } else if (process.arch === 'riscv64') {
      if (isMusl()) {
        try {
        return require('./rolldown-binding.linux-riscv64-musl.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-linux-riscv64-musl')
      } catch (e) {
        loadErrors.push(e)
      }

      } else {
        try {
        return require('./rolldown-binding.linux-riscv64-gnu.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-linux-riscv64-gnu')
      } catch (e) {
        loadErrors.push(e)
      }

      }
    } else if (process.arch === 'ppc64') {
      try {
        return require('./rolldown-binding.linux-ppc64-gnu.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-linux-ppc64-gnu')
      } catch (e) {
        loadErrors.push(e)
      }

    } else if (process.arch === 's390x') {
      try {
        return require('./rolldown-binding.linux-s390x-gnu.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return require('@rolldown/binding-linux-s390x-gnu')
      } catch (e) {
        loadErrors.push(e)
      }

    } else {
      loadErrors.push(new Error(`Unsupported architecture on Linux: ${process.arch}`))
    }
  } else {
    loadErrors.push(new Error(`Unsupported OS: ${process.platform}, architecture: ${process.arch}`))
  }
}

nativeBinding = requireNative()

if (!nativeBinding || process.env.NAPI_RS_FORCE_WASI) {
  try {
    nativeBinding = require('./rolldown-binding.wasi.cjs')
  } catch (err) {
    if (process.env.NAPI_RS_FORCE_WASI) {
      loadErrors.push(err)
    }
  }
  if (!nativeBinding) {
    try {
      nativeBinding = require('@rolldown/binding-wasm32-wasi')
    } catch (err) {
      if (process.env.NAPI_RS_FORCE_WASI) {
        loadErrors.push(err)
      }
    }
  }
}

if (!nativeBinding) {
  if (loadErrors.length > 0) {
    // TODO Link to documentation with potential fixes
    //  - The package owner could build/publish bindings for this arch
    //  - The user may need to bundle the correct files
    //  - The user may need to re-install node_modules to get new packages
    throw new Error('Failed to load native binding', { cause: loadErrors })
  }
  throw new Error(`Failed to load native binding`)
}

module.exports = nativeBinding
module.exports.Severity = nativeBinding.Severity
module.exports.ParseResult = nativeBinding.ParseResult
module.exports.ExportExportNameKind = nativeBinding.ExportExportNameKind
module.exports.ExportImportNameKind = nativeBinding.ExportImportNameKind
module.exports.ExportLocalNameKind = nativeBinding.ExportLocalNameKind
module.exports.getBufferOffset = nativeBinding.getBufferOffset
module.exports.ImportNameKind = nativeBinding.ImportNameKind
module.exports.parseAsync = nativeBinding.parseAsync
module.exports.parseAsyncRaw = nativeBinding.parseAsyncRaw
module.exports.parseSync = nativeBinding.parseSync
module.exports.parseSyncRaw = nativeBinding.parseSyncRaw
module.exports.rawTransferSupported = nativeBinding.rawTransferSupported
module.exports.ResolverFactory = nativeBinding.ResolverFactory
module.exports.EnforceExtension = nativeBinding.EnforceExtension
module.exports.ModuleType = nativeBinding.ModuleType
module.exports.sync = nativeBinding.sync
module.exports.HelperMode = nativeBinding.HelperMode
module.exports.isolatedDeclaration = nativeBinding.isolatedDeclaration
module.exports.moduleRunnerTransform = nativeBinding.moduleRunnerTransform
module.exports.transform = nativeBinding.transform
module.exports.BindingBundleEndEventData = nativeBinding.BindingBundleEndEventData
module.exports.BindingBundleErrorEventData = nativeBinding.BindingBundleErrorEventData
module.exports.BindingCallableBuiltinPlugin = nativeBinding.BindingCallableBuiltinPlugin
module.exports.BindingError = nativeBinding.BindingError
module.exports.BindingHmrOutput = nativeBinding.BindingHmrOutput
module.exports.BindingModuleInfo = nativeBinding.BindingModuleInfo
module.exports.BindingNormalizedOptions = nativeBinding.BindingNormalizedOptions
module.exports.BindingOutputAsset = nativeBinding.BindingOutputAsset
module.exports.BindingOutputChunk = nativeBinding.BindingOutputChunk
module.exports.BindingOutputs = nativeBinding.BindingOutputs
module.exports.BindingPluginContext = nativeBinding.BindingPluginContext
module.exports.BindingRenderedChunk = nativeBinding.BindingRenderedChunk
module.exports.BindingRenderedChunkMeta = nativeBinding.BindingRenderedChunkMeta
module.exports.BindingRenderedModule = nativeBinding.BindingRenderedModule
module.exports.BindingTransformPluginContext = nativeBinding.BindingTransformPluginContext
module.exports.BindingWatcher = nativeBinding.BindingWatcher
module.exports.BindingWatcherChangeData = nativeBinding.BindingWatcherChangeData
module.exports.BindingWatcherEvent = nativeBinding.BindingWatcherEvent
module.exports.Bundler = nativeBinding.Bundler
module.exports.ParallelJsPluginRegistry = nativeBinding.ParallelJsPluginRegistry
module.exports.BindingAttachDebugInfo = nativeBinding.BindingAttachDebugInfo
module.exports.BindingBuiltinPluginName = nativeBinding.BindingBuiltinPluginName
module.exports.BindingHookSideEffects = nativeBinding.BindingHookSideEffects
module.exports.BindingJsx = nativeBinding.BindingJsx
module.exports.BindingLogLevel = nativeBinding.BindingLogLevel
module.exports.BindingPluginOrder = nativeBinding.BindingPluginOrder
module.exports.FilterTokenKind = nativeBinding.FilterTokenKind
module.exports.registerPlugins = nativeBinding.registerPlugins
module.exports.shutdownAsyncRuntime = nativeBinding.shutdownAsyncRuntime
module.exports.startAsyncRuntime = nativeBinding.startAsyncRuntime
