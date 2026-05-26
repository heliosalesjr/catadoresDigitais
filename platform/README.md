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

## Permissões do aluno

- Tab **Presenças** oculta
- **Materiais** de aulas futuras bloqueados até 7 dias antes da data
- Aba **Professores**: somente nome e email visíveis (telefone oculto)
- **Modal de aula**: exibe input de código de chamada (não botões P/F/A)

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
```css
var(--c-bg)        /* fundo principal */
var(--c-bg-alt)    /* cards e painéis */
var(--c-text)      /* texto principal */
var(--c-subtle)    /* texto secundário */
var(--c-faint)     /* texto terciário */
var(--c-border)    /* bordas sutis */
var(--c-border-md) /* bordas de inputs */
```

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npx tsc --noEmit # checar tipos
```
