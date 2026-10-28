import { useEffect, useRef, useState, type FormEvent } from "react";

import { exchangeLoginToken } from "../api";
import { replaceRoute } from "../router";
import { saveSession, type Session } from "../session";

type Props = { token: string | null; onLogin: (session: Session) => void };

export function extractToken(input: string): string | null {
  const text = input.trim();
  const fromLink = text.match(/[?&]token=([A-Za-z0-9_-]+)/);
  if (fromLink) return fromLink[1];
  return /^[A-Za-z0-9_-]{20,}$/.test(text) ? text : null;
}

export function Login({ token, onLogin }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const [busy, setBusy] = useState(false);
  const redeemed = useRef<string | null>(null);

  function redeem(value: string) {
    if (redeemed.current === value) return;
    redeemed.current = value;
    setBusy(true);
    setError(null);
    exchangeLoginToken(value)
      .then((session) => {
        saveSession(session);
        onLogin(session);
        replaceRoute("/");
      })
      .catch((err: Error) => {
        setError(err.message);
        replaceRoute("/login");
      })
      .finally(() => setBusy(false));
  }

  useEffect(() => {
    if (token) redeem(token);
  }, [token]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = extractToken(pasted);
    if (!value) {
      setError("Cola o link completo que o bot te enviou.");
      return;
    }
    redeem(value);
  }

  if ((token || busy) && !error) {
    return <div className="center">A entrar…</div>;
  }

  return (
    <div className="center login">
      <img src="./icon.svg" alt="" width={72} height={72} />
      <h1>Finance Bot</h1>
      {error && <p className="error">{error}</p>}
      <p>
        Escreve <strong>dashboard</strong> ao bot no WhatsApp. Ele envia-te um link: abre-o, ou
        copia-o e cola-o aqui.
      </p>
      <form className="paste-form" onSubmit={submit}>
        <input
          value={pasted}
          onChange={(event) => setPasted(event.target.value)}
          placeholder="Cola aqui o link do bot"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button type="submit">Entrar</button>
      </form>
      <p className="muted">
        Se adicionaste a app ao ecrã principal, cola o link aqui: os links do WhatsApp abrem no
        browser, não na app. O link é pessoal e só funciona uma vez, durante 15 minutos.
      </p>
    </div>
  );
}
