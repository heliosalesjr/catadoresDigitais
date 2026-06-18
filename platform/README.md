# Catadores Digitais — Plataforma

Plataforma de gestão de turmas e aulas para o programa de formações gratuitas em tecnologia do Instituto Ipês, com patrocínio da CAIXA.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Firebase**: Auth (Google Sign-In), Firestore, Admin SDK
- **Tailwind CSS** + CSS variables para tema
- **Framer Motion** para animações
- **React Icons** (`hi2`)

## Roles

| Role | Acesso |
|------|--------|
| `admin` | Tudo — aprova aulas, gerencia usuários e allowlist |
| `teacher` | Cria aulas (ficam pendentes até aprovação), faz chamada |
| `student` | Vê turmas/aulas, responde chamada via código |

`canEdit = role === 'admin' || role === 'teacher'`

## Variáveis de ambiente

```env
NEXT_PUBLIC_ADMIN_EMAIL=          # email do admin hardcoded
NEXT_PUBLIC_OPEN_SIGNUP=true      # true = qualquer Google login aceito (dev); false = usa allowlist
NEXT_PUBLIC_FIREBASE_*            # config do Firebase client
FIREBASE_ADMIN_*                  # credenciais do Firebase Admin SDK
```

## Controle de acesso

Em produção (`OPEN_SIGNUP=false`), somente emails na coleção Firestore `allowlist/{email}` conseguem criar conta. A allowlist é gerenciada pelo admin no dashboard.

Sessão autenticada via cookie `cd_session` (server-side, `adminAuth.createSessionCookie`).

## Estrutura de dados (Firestore)

```
users/{uid}
  uid, email, name, photoURL, role, createdAt

allowlist/{email}
  email, role, createdAt

turmas/{id}
  name, icon, iconColor, startDate, endDate
  students: string[]   // emails matriculados

turmas/{id}/aulas/{id}
  title, description, date, startTime, endTime
  status: 'pending' | 'published'
  teachers: { uid, name }[]
  driveLinks: { label, url }[]
  attendance: { [email]: 'present' | 'absent' | 'late' }
  attendanceCode: string
  avaliacoes: Avaliacao[]

turmas/{id}/aulas/{id}/respostas/{email}
  studentEmail, studentName
  answers: { [avaliacaoId]: string }
  submittedAt: string (ISO)

users/{uid}/notas/{id}
  title, content (Markdown)
  turmaId: string
  createdAt, updatedAt: string (ISO)
```

## Rotas API

| Rota | Método | Auth | Descrição |
|------|--------|------|-----------|
| `/api/admin/allowlist` | GET, POST | admin | Lista e adiciona emails |
| `/api/admin/allowlist/[email]` | DELETE | admin | Remove email |
| `/api/admin/upcoming-aulas` | GET | editor | Próximas aulas (todas as turmas) |
| `/api/student/turmas` | GET | any | Turmas do aluno logado |
| `/api/student/upcoming-aulas` | GET | any | Aulas da semana atual + futuras |
| `/api/turmas/[id]/aulas` | GET, POST | any/editor | Lista e cria aulas |
| `/api/turmas/[id]/aulas/[aulaId]` | PATCH, DELETE | editor | Edita ou remove aula |
| `/api/turmas/[id]/aulas/[aulaId]/chamada` | POST | any | Aluno responde chamada com código |
| `/api/turmas/[id]/aulas/[aulaId]/respostas` | GET | any | Editor recebe todas as respostas; aluno recebe só a sua (ou `null`) |
| `/api/turmas/[id]/aulas/[aulaId]/respostas` | POST | any | Aluno envia respostas da avaliação (salva em `respostas/{email}`) |

## Permissões do aluno

- Tab **Presenças** oculta
- Tab **Banco de Aulas** oculta
- Tab **Anotações** visível **apenas para alunos** (editores não veem)
- **Materiais** de aulas futuras bloqueados até 7 dias antes da data
- Aba **Professores**: somente nome e email visíveis (telefone oculto)
- **Avaliações**: aluno vê apenas o botão "Responder Avaliação" (sem lista de questões); após enviar, o botão é substituído por um indicador "X de Y questões enviadas" e a avaliação não pode ser reaberta

## Anotações do aluno

Cada aluno pode criar múltiplas notas em Markdown, associadas à sua turma. As notas são armazenadas na subcoleção `users/{uid}/notas` (acesso permitido apenas ao próprio usuário pelas Firestore Rules).

**Componentes:**
- `AnotacoesPanel` — aba "Anotações" dentro da página da turma; exibe lista de notas + editor com preview em Markdown e auto-save de 1,5 s
- `useStudentLastNota` — busca a nota mais recente para o card de resumo no dashboard

**Navegação direta para a aba:** links no dashboard usam `?tab=anotacoes` na URL, e a página da turma lê esse parâmetro via `useSearchParams` para abrir a aba correspondente no `ConteudoPanel`.

**Firestore Rules** — a subcoleção de notas precisa de uma regra explícita (subcoleções não herdam automaticamente a regra do documento pai):
```
match /users/{uid} {
  allow read, write: if request.auth.uid == uid;
  match /notas/{notaId} {
    allow read, write: if request.auth.uid == uid;
  }
}
```

## Padrões importantes

### Firestore — inequality filters
Nunca combinar dois filtros de desigualdade em campos diferentes na mesma query. Firestore só permite inequality (`>=`, `!=`, etc.) em um único campo por query. Filtros adicionais devem ser feitos em JavaScript após o `.get()`:

```ts
// ERRADO — falha silenciosamente
.where('date', '>=', x).where('status', '!=', 'pending')

// CERTO
.where('date', '>=', x)
.orderBy('date')
.get()
.then(snap => snap.docs.filter(d => d.data().status !== 'pending'))
```

### CSS variables
Definidas em `src/context/ThemeContext.tsx` (objetos `DARK`/`LIGHT`, aplicadas via `root.style.setProperty`) com fallback em `src/app/globals.css` (`:root`). Os valores de cada tema são calibrados para contraste WCAG AA contra o respectivo `--c-bg`/`--c-bg-alt`.

```css
var(--c-bg)        /* fundo principal */
var(--c-bg-alt)    /* cards e painéis */
var(--c-text)      /* texto principal */
var(--c-muted)     /* texto secundário forte */
var(--c-subtle)    /* texto secundário */
var(--c-faint)     /* texto terciário — só uso decorativo, não informativo */
var(--c-border)    /* bordas sutis */
var(--c-border-md) /* bordas de inputs */
```

Cores semânticas de status/papel, cada uma com 3 variantes — base (texto/ícone), `-soft` (~10% opacidade, fundo de chip) e `-strong` (~30-45%, borda/hover/ênfase):
```css
var(--c-success) / --c-success-soft / --c-success-strong   /* presente, frequência boa */
var(--c-warning) / --c-warning-soft / --c-warning-strong   /* atraso, pendente, alerta */
var(--c-danger)  / --c-danger-soft  / --c-danger-strong    /* falta, erro, excluir */
var(--c-info)    / --c-info-soft    / --c-info-strong       /* badge "aluno" */
var(--c-purple)  / --c-purple-soft  / --c-purple-strong     /* badge "professor" */
var(--c-gold)    / --c-gold-soft    / --c-gold-strong       /* badge "admin" */
```

Para usar uma cor semântica como fundo sólido com texto legível em ambos os temas, use `color: var(--c-bg)` no texto em vez de um branco fixo — `--c-bg` é escuro no dark mode e claro no light mode, então o contraste se resolve automaticamente.

### Datas não podem ser no passado
Criar aula (calendário) e agendar aula do banco compartilham a mesma regra: a data não pode ser anterior a hoje, dentro da janela `startDate`/`endDate` da turma. A validação existe em duas camadas — client (atributo `min` do `<input type="date">`, calculado como `max(turmaStartDate, hoje)`) e servidor (`POST /api/turmas/[id]/aulas` e `POST /api/turmas/[id]/banco/[bancoId]/agendar` comparam `body.date` com a data atual). Editar uma aula já existente no passado continua permitido — a regra vale só para criar/agendar.

## Caching com TanStack Query

### O problema que o caching resolve

Sem cache, cada vez que o usuário navega de volta para o dashboard — saindo de uma turma, por exemplo — o React desmonta e remonta o componente, disparando todos os `fetch` novamente. O resultado é uma tela em branco ou com skeletons que some e reaparece, mesmo que os dados não tenham mudado nada.

O padrão **stale-while-revalidate** resolve isso: na volta ao dashboard, os dados do cache são exibidos *imediatamente*, e uma verificação em background acontece para confirmar se há novidade. O usuário nunca vê reload.

---

### Por que TanStack Query (e não SWR ou fetch puro)

| | Fetch puro + useState | SWR | TanStack Query |
|---|---|---|---|
| Cache entre navegações | Não | Sim | Sim |
| Deduplicação de requests | Não | Sim | Sim |
| Mutations com invalidação automática | Manual | Limitado | `useMutation` + `invalidateQueries` |
| DevTools visuais | Não | Não | Sim |
| Controle fino de staleTime por query | Não | Sim | Sim |

O SWR seria suficiente para o cache básico, mas o projeto usa mutations (adicionar à allowlist, alterar role, registrar chamada) que precisam refletir no cache de forma coordenada. O TanStack Query tem `useMutation` com `onSuccess` para isso, o que evita código manual de sincronização de estado.

---

### Conceitos fundamentais

#### `staleTime` — por quanto tempo os dados são "frescos"

```ts
new QueryClient({
  defaultOptions: {
    queries: { staleTime: 2 * 60 * 1000 } // 2 minutos
  }
})
```

Durante o `staleTime`, o cache é servido diretamente sem nenhum fetch. Após esse prazo, os dados ficam "stale" (velhos): na próxima vez que o componente montar ou a janela ganhar foco, um refetch silencioso acontece em background — mas os dados stale já aparecem na tela enquanto isso.

**Regra prática:** quanto mais frequentemente os dados mudam, menor o `staleTime`. Queries muito estáticas (ex: allowlist) usam `5 * 60 * 1000` (5 min). Queries dinâmicas (ex: upcoming-aulas) usam o default de 2 min.

#### `gcTime` — por quanto tempo os dados ficam na memória após unmount

O valor padrão é 5 minutos. Após esse tempo sem nenhum componente usando aquela query, os dados são removidos da memória. Se o usuário voltar antes disso, os dados ainda estão lá. Se voltar depois, uma tela de loading aparece normalmente (como na primeira visita).

#### `isLoading` vs `isFetching`

| Flag | Quando é `true` |
|------|-----------------|
| `isLoading` | Query nunca foi executada ainda (sem dados em cache) |
| `isFetching` | Qualquer fetch em curso, incluindo refetch silencioso em background |

Os skeletons devem usar `isLoading` — assim não piscam durante refetches em background quando já há dados na tela.

#### `enabled` — queries condicionais

```ts
const { loading: authLoading } = useAuth()
const { data } = useStudentTurmas(!authLoading)
```

Queries com `enabled: false` ficam em estado `idle` — não fazem fetch, não atualizam o cache. Isso é necessário aqui porque as rotas API validam a sessão do usuário: disparar um fetch antes de a autenticação estar resolvida retornaria 401.

O loading efetivo nos componentes combina os dois estados:
```ts
const turmasLoading = authLoading || turmasQuery.isLoading
```

---

### Estrutura de cache do projeto

Cada endpoint tem seu próprio hook e sua própria **query key** — um array que identifica unicamente aquele dado no cache global.

```
['student', 'turmas']            → /api/student/turmas
['student', 'upcoming-aulas']    → /api/student/upcoming-aulas
['student', 'frequencia']        → /api/student/frequencia
['student', 'last-nota', uid]    → Firestore users/{uid}/notas (última nota)
['teacher', 'turmas']            → /api/teacher/turmas
['teacher', 'upcoming-aulas']    → /api/teacher/upcoming-aulas
['admin', 'upcoming-aulas']      → /api/admin/upcoming-aulas
['admin', 'allowlist']           → /api/admin/allowlist
['admin', 'turmas']              → /api/admin/turmas
['admin', 'users']               → /api/admin/users
```

Usar arrays hierárquicos (`['admin', 'turmas']`) permite invalidar grupos inteiros se necessário:
```ts
// Invalida tudo do admin de uma vez
queryClient.invalidateQueries({ queryKey: ['admin'] })
```

---

### Mutations e sincronização de cache

Quando uma action do usuário muda dados no servidor, o cache precisa ser atualizado. Há dois padrões em uso:

#### `invalidateQueries` — refaz o fetch para garantir consistência

Usado quando a resposta do servidor pode diferir do que o cliente calcularia (ex: campos gerados pelo servidor, timestamps, etc.):

```ts
// useAdminAllowlist.ts
const addMutation = useMutation({
  mutationFn: (data) => fetch('/api/admin/allowlist', { method: 'POST', ... }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'allowlist'] }),
})
```

Após o POST, o TanStack Query refaz o GET da allowlist automaticamente e atualiza a UI.

#### `setQueryData` — atualiza o cache diretamente sem refetch

Usado quando a mudança é previsível (ex: remover um item por ID):

```ts
// useUsers.ts
const deleteUserMutation = useMutation({
  mutationFn: (uid) => fetch(`/api/admin/users/${uid}`, { method: 'DELETE' }),
  onSuccess: (_, uid) =>
    queryClient.setQueryData(['admin', 'users'], (prev) =>
      prev?.filter((u) => u.uid !== uid) ?? []
    ),
})
```

O item some da lista imediatamente, sem precisar de um refetch que buscaria todos os usuários novamente.

---

### Lazy loading de turmas no admin

O dashboard admin só precisa da lista de turmas quando o usuário abre um modal (lista de usuários ou detalhe de usuário). Buscar isso no mount seria desperdício:

```ts
// Começa desabilitado
const [turmasEnabled, setTurmasEnabled] = useState(false)
const { data: turmas = [] } = useAdminTurmas(turmasEnabled)

// Habilita na primeira ação que precisar
function openCard(filter) {
  setActiveCard(filter)
  setTurmasEnabled(true) // dispara o fetch uma única vez
}
```

Depois do primeiro fetch, o `staleTime` de 5 minutos garante que abrir e fechar modais múltiplas vezes não dispara novos requests — o cache é servido diretamente.

---

### QueryProvider e DevTools

O `QueryClientProvider` fica em `src/providers/QueryProvider.tsx` e é inserido no layout raiz, dentro do `ThemeProvider`. A instância do `QueryClient` é criada com `useState` (não no corpo do módulo) para que cada usuário/request tenha seu próprio cache isolado — essencial em ambientes com Server-Side Rendering.

Em desenvolvimento, o ícone do TanStack Query DevTools aparece no canto da tela. Clicando nele é possível inspecionar o estado de cada query, ver dados em cache, forçar refetches e simular erros.

---

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npx tsc --noEmit # checar tipos
```
