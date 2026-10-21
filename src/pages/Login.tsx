import { useEffect, useRef, useState } from "react";

import { exchangeLoginToken } from "../api";
import { replaceRoute } from "../router";
import { saveSession, type Session } from "../session";

type Props = { token: string | null; onLogin: (session: Session) => void };

export function Login({ token, onLogin }: Props) {
  const [error, setError] = useState<string | null>(null);
  const redeemed = useRef<string | null>(null);

  useEffect(() => {
    if (!token || redeemed.current === token) return;
    redeemed.current = token;
    exchangeLoginToken(token)
      .then((session) => {
        saveSession(session);
        onLogin(session);
        replaceRoute("/");
      })
      .catch((err: Error) => {
        setError(err.message);
        replaceRoute("/login");
      });
  }, [token, onLogin]);

  if (token && !error) {
    return <div className="center">A entrar…</div>;
  }

  return (
    <div className="center login">
      <img src="./icon.svg" alt="" width={72} height={72} />
      <h1>Finance Bot</h1>
      {error && <p className="error">{error}</p>}
      <p>
        Para entrares, escreve <strong>dashboard</strong> ao bot no WhatsApp e abre o link que ele
        te envia.
      </p>
      <p className="muted">O link é pessoal e só funciona uma vez, durante 15 minutos.</p>
    </div>
  );
}
