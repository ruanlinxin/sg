
type UniverCreateResult = {
  univer?: any
  univerAPI?: any
}

type UniverClientMountResult = {
  univer: any
  univerAPI: any
}

const store = {
  js: [
    'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
    'https://unpkg.com/rxjs/dist/bundles/rxjs.umd.min.js',
    'https://unpkg.com/echarts@5.6.0/dist/echarts.min.js',
    'https://unpkg.com/@univerjs/presets/lib/umd/index.js',
    'https://unpkg.com/@univerjs/preset-sheets-core/lib/umd/index.js',
    'https://unpkg.com/@univerjs/preset-sheets-core/lib/umd/locales/zh-CN.js'
  ],
  css: ['https://unpkg.com/@univerjs/preset-sheets-core/lib/index.css'],
  loadStatus: 0, // 0: 未加载 1: 加载中 2: 加载完成
  promise: Promise.resolve()
}

function ensureCss(url: string) {
  const exists = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((x) => x.getAttribute('href') === url)
  if (exists) return
  const link = document.createElement('link')
  link.href = url
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

function ensureScript(url: string) {
  const exists = Array.from(document.querySelectorAll('script')).some((x) => x.getAttribute('src') === url)
  if (exists) return Promise.resolve()
  const script = document.createElement('script')
  script.src = url
  return new Promise<void>((resolve, reject) => {
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`加载脚本失败：${url}`))
    document.body.appendChild(script)
  })
}

const loadAssets = async () => {
  if (store.loadStatus !== 0) return store.promise
  store.loadStatus = 1
  store.css.forEach(ensureCss)
  store.promise = (async () => {
    for (const url of store.js) {
      await ensureScript(url)
    }
  })().finally(() => {
    store.loadStatus = 2
  })
  return store.promise
}

class Univer {
  load = Promise.resolve()
  private _univer: any | null = null
  private _univerAPI: any | null = null

  constructor() {
    this.load = loadAssets()
  }

  get univer() {
    return this._univer
  }

  get api() {
    return this._univerAPI
  }

  async mount(container: HTMLElement | string): Promise<UniverClientMountResult> {
    await this.load

    const w = window as any
    const createUniver = w?.UniverPresets?.createUniver
    const UniverSheetsCorePreset = w?.UniverPresetSheetsCore?.UniverSheetsCorePreset

    if (!createUniver) throw new Error('UniverPresets.createUniver 未加载')
    if (!UniverSheetsCorePreset) throw new Error('UniverPresetSheetsCore.UniverSheetsCorePreset 未加载')

    const LocaleType = w?.UniverCore?.LocaleType
    const mergeLocales = w?.UniverCore?.mergeLocales
    const FUniver = w?.UniverCore?.FUniver

    const createResult: UniverCreateResult = createUniver({
      locale: LocaleType?.ZH_CN,
      locales: LocaleType && mergeLocales && w?.UniverPresetSheetsCoreZhCN
        ? { [LocaleType.ZH_CN]: mergeLocales(w.UniverPresetSheetsCoreZhCN) }
        : undefined,
      presets: [
        UniverSheetsCorePreset({
          container
        })
      ]
    })

    const univer = createResult?.univer ?? createResult
    const univerAPI = createResult?.univerAPI ?? (FUniver?.newAPI ? FUniver.newAPI(univer) : null)

    this._univer = univer
    this._univerAPI = univerAPI

    // 先渲染出一个最小可用的工作簿，后续页面再补充业务逻辑
    try {
      if (univerAPI?.getActiveWorkbook?.()) return { univer, univerAPI }
      univerAPI?.createWorkbook?.({ id: 'Sheet1', name: 'Sheet1' })
    } catch {
      // 忽略：不同版本 API 可能存在差异
    }

    return { univer, univerAPI }
  }

  dispose() {
    try {
      this._univer?.dispose?.()
    } finally {
      this._univer = null
      this._univerAPI = null
    }
  }
}

export default () => {
  return new Univer()
}