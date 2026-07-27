# Catadores Digitais — Plataforma (Vite + React)

Versão da plataforma **sem Next.js e sem Vercel**: SPA em Vite + React 19 + TypeScript,
com **Firebase Auth (Google)** e **Firestore acessados direto do cliente**.
Todas as features da versão Next foram mantidas.

## Stack

- Vite 6 + React 19 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router 7 (substitui o roteamento do App Router)
- TanStack Query (mesmos hooks/keys da versão anterior)
- Firebase JS SDK (Auth + Firestore) — **sem** `firebase-admin`

## O que mudou na arquitetura

| Antes (Next) | Agora (Vite SPA) |
|---|---|
| ~25 rotas `/api/*` com `firebase-admin` | Camada de serviços em `src/services/*` usando o SDK client |
| Sessão server-side (cookie HttpOnly + proxy) | `onAuthStateChanged` + guards de rota (`RequireAuth`) no router |
| Autorização nas rotas de API | **Firestore Security Rules** (`firestore.rules`) |
| Cron da Vercel (`/api/cron/archive-turmas`) | Auto-arquivamento ao listar/abrir turmas no painel admin |
| `/api/auth/enroll` (matrícula no 1º login) | Feita no cliente após o login (`src/lib/auth-helpers.ts`) |

## Rodando

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc + vite build → dist/
```

O `.env.local` usa as mesmas variáveis da versão Next, com prefixo `VITE_`
(já foi gerado a partir do `.env.local` do projeto `platform`).

## Testando com os emuladores (sem tocar no Firebase real)

Com `VITE_USE_EMULATORS=true` no `.env.local` (já é o padrão em dev), o app
conecta nos **emuladores locais** de Auth e Firestore — zero risco para os
dados de produção. Em dois terminais:

```bash
npm run emulators   # Auth :9099, Firestore :8080, UI em http://127.0.0.1:4000
npm run dev         # http://localhost:5173
```

Como funciona:

- O emulador do Firestore **aplica o `firestore.rules` desta pasta** — ou seja,
  você testa as regras novas de verdade, com hot-reload ao editar o arquivo.
- O login com Google abre um seletor **fake** do emulador: você digita qualquer
  e-mail/nome e cria contas de teste na hora. Para virar **admin**, entre com o
  e-mail configurado em `VITE_ADMIN_EMAIL`. Depois crie uma turma, adicione
  outro e-mail à allowlist e entre com ele em uma janela anônima para testar
  como aluno/professor.
- Os dados ficam em `./emulator-data` (exportados ao encerrar com Ctrl+C e
  reimportados no próximo start) — seu progresso de teste sobrevive a restarts.
- Para voltar a usar o Firebase real: `VITE_USE_EMULATORS=false`. Builds de
  produção nunca conectam no emulador (a flag só vale em `npm run dev`).

> O emulador do Firestore precisa de Java. O script `emulators` já usa o
> OpenJDK do Homebrew (`/opt/homebrew/opt/openjdk`).

## ⚠️ Antes de usar em produção

1. **Deploy das novas Security Rules** — o arquivo `firestore.rules` desta pasta
   substitui o da versão Next (que bloqueava toda escrita, pois tudo passava pelo
   Admin SDK). Sem esse deploy, nada que escreve no banco funciona:

   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Domínio autorizado no Firebase Auth** — adicione o domínio onde a SPA vai
   rodar em *Authentication → Settings → Authorized domains*.

3. **SPA fallback** — o host precisa redirecionar todas as rotas para
   `index.html` (Netlify: `_redirects` com `/* /index.html 200`; Cloudflare
   Pages/Firebase Hosting têm opção equivalente).

## Limitações conhecidas (sem servidor)

- **Excluir usuário** remove apenas o perfil no Firestore. A conta no Firebase
  Auth continua existindo, mas sem doc em `users` (e fora da allowlist) o login
  é recusado. Para apagar a conta de Auth de verdade seria preciso uma Cloud
  Function com Admin SDK.
- **Código de chamada** — a validação do código de 4 dígitos acontece no
  cliente (o aluno tecnicamente consegue ler o código via DevTools). As rules
  garantem que o aluno só marca a **própria** presença como `present`, nunca a
  de outros. Se isso for um problema, o caminho é uma Cloud Function.
- **Auto-arquivamento de turmas** roda quando um admin abre a lista de turmas
  (não mais via cron diário).
- A promoção de role `student → teacher` continua restrita (rules), e ninguém
  vira `admin` via cliente.
