# Finance Bot — App web

App web (PWA) do [Finance WhatsApp Bot](https://github.com/LuanMoreno10/finance-whatsapp-bot): resumo do mês com gráficos, lista de despesas (adicionar, editar, apagar) e gestão de orçamentos. Feita para o telemóvel; pode ser instalada no ecrã principal.

## Como funciona o acesso

Não há passwords. Escreves **"dashboard"** ao bot no WhatsApp e ele envia um link pessoal, de uso único e válido durante 15 minutos. A app troca esse link por uma sessão de 30 dias e passa a falar com a API em nome dessa pessoa (rotas `/me`). O link vai depois do `#`, por isso nunca chega aos servidores do GitHub Pages.

Este repositório não tem segredos: só o endereço público da API (`.env.production`).

## Stack

React 19 + TypeScript + Vite, Recharts para os gráficos, publicado no GitHub Pages com GitHub Actions.

## Desenvolvimento

```bash
npm install
npm run dev        # http://localhost:5173, usa a API em VITE_API_URL (.env.development)
npm run build      # verifica os tipos e gera dist/
```

A API tem de autorizar a origem da app em `WEB_ALLOWED_ORIGINS`, e o bot usa `WEB_APP_URL` para construir os links de login.

## Publicação

Cada push para `main` constrói e publica no GitHub Pages (`.github/workflows/deploy.yml`). Em *Settings → Pages*, a fonte tem de ser **GitHub Actions**.
