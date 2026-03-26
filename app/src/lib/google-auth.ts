const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleCredentialPayload {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

let scriptLoader: Promise<void> | null = null;

function decodeJwtPayload<T>(token: string): T | null {
  const tokenParts = token.split('.');
  if (tokenParts.length < 2) {
    return null;
  }

  try {
    const normalized = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = window.atob(normalized);
    const json = decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );

    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';
}

export function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptLoader) {
    return scriptLoader;
  }

  scriptLoader = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Gagal memuat Google script.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Gagal memuat Google script.'));
    document.head.appendChild(script);
  });

  return scriptLoader;
}

export async function requestGoogleCredential() {
  const clientId = getGoogleClientId();

  if (!clientId) {
    throw new Error('Google Client ID belum diatur.');
  }

  await loadGoogleIdentityScript();

  const googleIdentity = window.google?.accounts?.id;

  if (!googleIdentity) {
    throw new Error('Google Identity Services belum siap.');
  }

  return new Promise<GoogleCredentialPayload>((resolve, reject) => {
    let settled = false;

    const finishError = (message: string) => {
      if (!settled) {
        settled = true;
        reject(new Error(message));
      }
    };

    googleIdentity.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response.credential) {
          finishError('Google tidak mengembalikan credential.');
          return;
        }

        const profile = decodeJwtPayload<GoogleCredentialPayload>(response.credential);

        if (!profile?.email) {
          finishError('Data akun Google tidak valid.');
          return;
        }

        settled = true;
        resolve(profile);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    googleIdentity.prompt((notification) => {
      if (settled) {
        return;
      }

      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        finishError('Popup Google tidak tersedia. Pastikan browser mengizinkan popup.');
      } else if (notification.isDismissedMoment()) {
        finishError('Login Google dibatalkan.');
      }
    });
  });
}
