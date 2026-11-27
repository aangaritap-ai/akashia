import type messages from "../../messages/es.json";
import type { AppLocale } from "./routing";

// Hace que un texto que no exista en es.json sea un error al compilar.
declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof messages;
  }
}
