import { createTranslator } from "next-intl";
import es from "../../messages/es.json";

/** Textos para lo que se genera sin una persona mirando (la tarea diaria y los
 * avisos que se guardan). Por ahora, en español. */
export function savedTexts() {
  return createTranslator({ locale: "es", messages: es, namespace: "dates" });
}
