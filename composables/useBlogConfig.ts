// Preload blog config data for the current locale
import enConfig from "~/data/en/config.json";
import idConfig from "~/data/id/config.json";
import jaConfig from "~/data/ja/config.json";

export interface BlogConfig {
  title: string;
  description: string;
  image: string;
  aboutImage: string;
}

const blogConfigs = {
  en: enConfig as BlogConfig,
  id: idConfig as BlogConfig,
  ja: jaConfig as BlogConfig,
} as Record<string, BlogConfig>;

export default function () {
  const { locale, defaultLocale } = useI18n();

  const blogConfig = computed(() => {
    return blogConfigs[locale.value] || blogConfigs[defaultLocale];
  });

  return blogConfig;
}
