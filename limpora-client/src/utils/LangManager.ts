type LangData = Record<string, Record<string, string>>
type GlobModules = Record<string, () => Promise<string | (() => Promise<string>)>>

export class LangManager {
    private static instance: LangManager | null = null;
    private selectedLang: string = 'es_ES';
    private langData: LangData = {};
    private langs: any = import.meta.glob('../assets/lang/*.lang', { as: 'raw' });

    constructor() {
        if (LangManager.instance) return LangManager.instance
        LangManager.instance = this
    }

    async init(): Promise<void> {
        for (const path in this.langs) {
            const content = await this.langs[path]()
            const key = path.split('/').pop()!.replace('.lang', '')
            this.langData[key] = this.parse(content)
        }
    }

    private parse(content: string): Record<string, string> {
        const table: Record<string, string> = {}
        content.split('\n').forEach(line => {
            if (!line.startsWith('#')) {
                const [k, v] = line.split('=')
                if (k && v !== undefined) table[k.trim()] = v.trim()
            }
        })
        return table
    }

    setLang(langCode: string): void {
        this.selectedLang = langCode
    }

    get(key: string): string {
        return this.langData[this.selectedLang]?.[key] ?? key
    }
}

const manager = new LangManager()

export async function initLangManager(): Promise<void> {
    await manager.init()
}

export default function lang(key: string = 'info.text.default', langCode: string | null = null): string {
    if (langCode) manager.setLang(langCode)
    return manager.get(key)
}