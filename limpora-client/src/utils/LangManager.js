export class LangManager {
    static instance = null;

    constructor() {
        if (LangManager.instance) return LangManager.instance;

        this.selectedLang = 'es_ES';
        this.langData = {};
        this.langs = import.meta.glob('../assets/lang/*.lang', { as: 'raw' });

        LangManager.instance = this;
    }

    async init() {
        for (const path in this.langs) {
            const content = await this.langs[path]();
            const key = path.split('/').pop().replace('.lang', '');
            this.langData[key] = this.parse(content);
        }
    }

    parse(content) {
        const table = {};
        content.split('\n').forEach(line => {
            if (!line.startsWith("#")) {
                const [k, v] = line.split('=');
                if (k && v !== undefined) table[k.trim()] = v.trim();
            }
        });
        return table;
    }

    setLang(langCode) {
        this.selectedLang = langCode;
    }

    get(key) {
        return this.langData[this.selectedLang]?.[key] || key;
    }
}

let manager = new LangManager();
export async function initLangManager() {
    await manager.init();
}
export default function lang(key = "info.text.default", langCode = null) {
    if (langCode) manager.setLang(langCode);
    return manager.get(key);
}
