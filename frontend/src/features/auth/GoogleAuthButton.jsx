import { useEffect, useId, useMemo, useRef, useState } from 'react';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID =
  typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GOOGLE_CLIENT_ID?.trim() || '' : '';

let googleScriptPromise = null;

function loadGoogleScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google sign-in is only available in the browser.'));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Could not load Google sign-in.')), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => reject(new Error('Could not load Google sign-in.'));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

export function GoogleAuthButton({ label = 'Continue with Google', onCredential, onError, disabled = false }) {
  const containerRef = useRef(null);
  const [buttonError, setButtonError] = useState('');
  const instanceId = useId();
  const htmlId = useMemo(() => `google-auth-${instanceId.replace(/:/g, '-')}`, [instanceId]);

  useEffect(() => {
    let isCancelled = false;

    if (!GOOGLE_CLIENT_ID || disabled) {
      return undefined;
    }

    loadGoogleScript()
      .then((google) => {
        if (isCancelled || !containerRef.current || !google?.accounts?.id) {
          return;
        }

        containerRef.current.innerHTML = '';
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (!response?.credential) {
              const error = new Error('Google sign-in did not return a valid credential.');
              setButtonError(error.message);
              onError?.(error);
              return;
            }

            try {
              setButtonError('');
              await onCredential?.(response.credential);
            } catch (error) {
              const normalizedError =
                error instanceof Error ? error : new Error('Google sign-in could not be completed.');
              setButtonError(normalizedError.message);
              onError?.(normalizedError);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          shape: 'pill',
          size: 'large',
          text: label === 'Create account with Google' ? 'signup_with' : 'signin_with',
          logo_alignment: 'left',
          width: 320,
        });
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        setButtonError(error.message || 'Google sign-in is unavailable right now.');
        onError?.(error);
      });

    return () => {
      isCancelled = true;
    };
  }, [disabled, label, onCredential, onError]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  const shouldRenderInlineError = !onError;

  return (
    <div className="google-auth">
      <div className="google-auth__divider" aria-hidden="true">
        <span>or</span>
      </div>
      <div id={htmlId} ref={containerRef} className="google-auth__button" />
      {shouldRenderInlineError && buttonError ? (
        <p className="login-form__error" role="alert">
          {buttonError}
        </p>
      ) : null}
    </div>
  );
}
