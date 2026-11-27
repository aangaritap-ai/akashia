"use client";

import { useSyncExternalStore } from "react";

// Chrome, Edge y Samsung Internet avisan con "beforeinstallprompt" que se puede
// instalar. El aviso llega una sola vez, así que se guarda apenas carga la app.
type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const HIDDEN_KEY = "akashia:instalar-oculto";

let promptEvent: PromptEvent | null = null;
let installed = false;
let cardHidden = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    // En lugar del aviso del navegador, mostramos nuestro botón.
    event.preventDefault();
    promptEvent = event as PromptEvent;
    installed = false;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    promptEvent = null;
    installed = true;
    emit();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Ya se está usando como aplicación instalada. */
function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function readCardHidden() {
  if (cardHidden) return true;
  try {
    return localStorage.getItem(HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** En el servidor no se sabe: el botón aparece al cargar en el dispositivo. */
export function useCanOfferInstall() {
  return useSyncExternalStore(
    subscribe,
    () => !installed && !isStandalone(),
    () => false
  );
}

export function useCardHidden() {
  return useSyncExternalStore(subscribe, readCardHidden, () => true);
}

export function hideCard() {
  cardHidden = true;
  try {
    localStorage.setItem(HIDDEN_KEY, "1");
  } catch {
    // Sin almacenamiento, queda oculta solo hasta recargar.
  }
  emit();
}

/**
 * Abre la instalación del navegador. Devuelve false cuando no se puede y hay
 * que explicar los pasos. Se llama directamente desde un clic.
 */
export async function promptInstall() {
  const event = promptEvent;
  if (!event) return false;
  // Cada aviso sirve una sola vez.
  promptEvent = null;
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === "accepted") {
      installed = true;
      emit();
    }
    return true;
  } catch {
    return false;
  }
}
