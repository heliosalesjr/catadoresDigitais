# Catadores Digitais — Estado do Projeto

## Stack

| Projeto | Tecnologias |
|---------|------------|
| Landing | Vite + React + TypeScript + Tailwind + Framer Motion |
| Platform | Next.js 16 (App Router, Turbopack) + Firebase (Auth + Firestore) + Tailwind v4 |

---

## Landing Page

### Concluído ✅
- Navbar com logo "Catadores Digitais" (Barlow Condensed, gradiente, sem ícone) + toggle de tema
- Hero section com animações
- Seção de Cursos
- Seção de Público-alvo / Inscrições
- Seção "Realização e Patrocínio" com logos reais (Instituto Ipês + Caixa Econômica Federal)
- Marquee de tecnologias ensinadas
- Footer com navegação e tagline
- Tema dark/light persistido
- Responsividade mobile com menu hambúrguer

### Pendente ❌
- Formulário de inscrição funcional (atualmente é "Em breve")
- Integração com backend para captura de leads
- SEO: meta tags, Open Graph, sitemap
- Deploy em produção

---

## Platform

### Autenticação
| Feature | Status |
|---------|--------|
| Login com Google | ✅ |
| Sessão server-side (cookies HttpOnly) | ✅ |
| Proteção de rotas por role (admin / teacher / student) | ✅ |
| Logout | ✅ |
| Matrícula automática na turma do convite (allowlist) no primeiro login (`/api/auth/enroll`) | ✅ |
| Logout automático por inatividade | ❌ |

---

### Navbar do Dashboard
| Feature | Status |
|---------|--------|
| Logo "Catadores Digitais" linkando para landing | ✅ |
| Título do painel por role com link para home | ✅ |
| Avatar, nome e e-mail do usuário | ✅ |
| Toggle de tema dark/light | ✅ |
| Botão de logout | ✅ |

---

### Painel Admin
| Feature | Status |
|---------|--------|
| Stats: total de alunos, professores, admins | ✅ |
| "Próximas aulas" com turma, professor e horário | ✅ |
| Acesso rápido às turmas | ✅ |
| Lista de usuários com gestão de roles (aluno ↔ professor) | ✅ |
| Busca / filtro na lista de usuários (filtro padrão: Professores) | ✅ |
| Paginação de 10 usuários por página | ✅ |
| Deletar usuário (com confirmação inline) | ✅ |
| Allowlist: adicionar / remover emails com role + turma obrigatória | ✅ |
| Allowlist mostra a turma vinculada a cada convite na lista | ✅ |
| UserDetailPanel (slide-over de detalhes do usuário) | ✅ |
| UserDetailPanel: adicionar / remover de turmas (aluno e professor) | ✅ |

---

### Painel do Professor
| Feature | Status |
|---------|--------|
| Stats: minhas turmas, alunos no total, aulas esta semana, próximas aulas | ✅ |
| Minhas turmas (filtradas via `/api/teacher/turmas`) | ✅ |
| Próximas aulas do professor (via `/api/teacher/upcoming-aulas`) | ✅ |
| Link para a turma a partir das próximas aulas | ✅ |
| Gestão de aulas/materiais nas turmas onde é professor | ✅ (via CalendarGrid) |

---

### Painel do Aluno
| Feature | Status |
|---------|--------|
| Stats: aulas esta semana, próximas aulas, frequência (%) | ✅ |
| Aviso de frequência baixa (< 85%) | ✅ |
| Minha turma com barra de progresso temporal | ✅ |
| Próximas aulas agrupadas por data com tag da turma e professor | ✅ |
| Link direto para página da aula (`/dashboard/aula/[turmaId]/[aulaId]`) | ✅ |

---

### Turmas
| Feature | Status |
|---------|--------|
| Listar turmas com ícone e cor | ✅ |
| Criar turma (nome, ícone, cor, datas, alunos) | ✅ |
| Editar turma | ✅ |
| Deletar turma (na lista e na edição, com confirmação) | ✅ |
| Gerenciar alunos/professores matriculados direto na tela de edição da turma | ❌ (hoje só é possível via perfil do usuário, no painel admin) |

---

### Aulas
| Feature | Status |
|---------|--------|
| CalendarGrid — grade mensal de aulas | ✅ |
| Sincronização de mês entre calendário e painel de conteúdo | ✅ |
| Criar aula (data, horário, título, descrição, professores) | ✅ |
| Editar aula | ✅ |
| Deletar aula | ✅ |
| Bloqueio de data passada ao criar aula (calendário não deixa clicar em dia passado; campo de data com `min`; validação também na API) | ✅ |
| Calendário colapsável com FAB para reabrir | ✅ |
| Página individual de aula (`/dashboard/aula/[turmaId]/[aulaId]`) | ✅ |
| CTA "Criar primeira aula" no estado vazio da aba Conteúdo (abre `AulaModal` com data padrão = hoje, se dentro do período da turma) | ✅ |
| CTA "Agendar nova aula" (borda tracejada) abaixo da lista, quando já existem aulas | ✅ |
| Badge do mês/ano no topo da aba Conteúdo com cor saturada da turma, sincronizado com o calendário ao lado | ✅ |

> O modal de aula (`AulaModal`) não exibe mais **Arquivos**, **Código de chamada** nem **Chamada** — isso fica a cargo das abas **Conteúdo** e **Banco de Aulas**, e da página individual da aula.

---

### Banco de Aulas
| Feature | Status |
|---------|--------|
| Criar aula no banco (`turmas/{id}/banco/{bancoId}`) | ✅ |
| Editar / deletar aula do banco | ✅ |
| Agendar aula do banco para uma data (`/api/turmas/[id]/banco/[bancoId]/agendar`) | ✅ |
| Painel BancoPanel com lista e modal de criação/edição | ✅ |
| AgendarBancoModal para escolher data e horário ao agendar | ✅ |
| Botão "Agendar" (disponíveis) vs "Agendar novamente" (aplicadas) | ✅ |
| Bloqueio de data passada ao agendar (campo `min` + validação na API) | ✅ |

---

### Materiais
| Feature | Status |
|---------|--------|
| Adicionar link (Drive, YouTube, Vimeo, Docs, Slides) | ✅ |
| Detecção automática de tipo (vídeo vs documento) | ✅ |
| Visualizador inline com iframe (MaterialViewer) | ✅ |
| "Abrir em nova aba" | ✅ |
| Remover material | ❌ |
| Reordenar materiais | ❌ |

---

### Avaliações
| Feature | Status |
|---------|--------|
| Tipo "Link" — resposta deve ser uma URL válida | ✅ |
| Tipo "Texto" — resposta aberta com limite de 404 caracteres | ✅ |
| Tipo "Quiz" — 5 opções, primeira é a correta, embaralhadas para o aluno | ✅ |
| Criar avaliação | ✅ |
| Deletar avaliação | ✅ |
| "Testar avaliação" — simulação da visão do aluno | ✅ |
| Submissão real pelo aluno via página da aula | ✅ |
| API `/api/turmas/[id]/aulas/[aulaId]/respostas` (GET por role, POST do aluno) | ✅ |
| Ver respostas dos alunos (visão professor / admin) — dentro do modal de chamada (`ChamadaEditModal`), por aluno, com indicador de certo/errado em quiz e link clicável | ✅ |
| Feedback / correção de respostas abertas | ❌ |

---

### Frequência (Chamada)
| Feature | Status |
|---------|--------|
| Campo `attendance` no tipo `Aula` | ✅ |
| `attendanceCode` — código de 4 dígitos gerado pelo professor | ✅ |
| Professor revela o código de chamada (botão "Código de chamada", aba Conteúdo/Presenças); desabilitado em aulas já encerradas | ✅ |
| Aluno responde chamada com código (página `/dashboard/aula/[turmaId]/[aulaId]`) | ✅ |
| API `/api/turmas/[id]/aulas/[aulaId]/chamada` (POST) | ✅ |
| API `/api/student/frequencia` — percentual de presença do aluno | ✅ |
| Edição manual de presença (Presente/Falta) pelo professor — botão "Mostrar alunos (N)" na aba Presenças abre `ChamadaEditModal`, com salvamento em tempo real por aluno (PATCH a cada clique) | ✅ |
| Status "Atrasado" (`late`) — ainda existe no schema/legado (frequência conta como presença), mas não é mais oferecido na UI manual, só Presente/Falta | ℹ️ |
| Relatório de frequência por aluno (visão admin/teacher) | ❌ |

---

## Rotas API (plataforma)

| Rota | Método | Acesso |
|------|--------|--------|
| `/api/auth/session` | POST | público |
| `/api/auth/enroll` | POST | usuário autenticado (self, matrícula automática no 1º login) |
| `/api/admin/allowlist` | GET, POST | admin |
| `/api/admin/allowlist/[email]` | DELETE | admin |
| `/api/admin/upcoming-aulas` | GET | admin/teacher |
| `/api/admin/users` | GET | admin |
| `/api/admin/users/[uid]` | PATCH, DELETE | admin |
| `/api/admin/turmas` | GET | admin |
| `/api/admin/turmas/[id]` | GET, PATCH, DELETE | admin |
| `/api/teacher/turmas` | GET | teacher |
| `/api/teacher/upcoming-aulas` | GET | teacher |
| `/api/student/turmas` | GET | student |
| `/api/student/upcoming-aulas` | GET | student |
| `/api/student/frequencia` | GET | student |
| `/api/turmas/[id]` | GET, PATCH, DELETE | editor |
| `/api/turmas/[id]/aulas` | GET, POST | editor |
| `/api/turmas/[id]/aulas/[aulaId]` | GET, PATCH, DELETE | editor |
| `/api/turmas/[id]/aulas/[aulaId]/chamada` | POST | any |
| `/api/turmas/[id]/aulas/[aulaId]/respostas` | GET, POST | any (GET: editor vê todas; aluno vê só as suas) |
| `/api/turmas/[id]/banco` | GET, POST | editor |
| `/api/turmas/[id]/banco/[bancoId]` | GET, PATCH, DELETE | editor |
| `/api/turmas/[id]/banco/[bancoId]/agendar` | POST | editor |
| `/api/users/teachers` | GET | editor |

---

## Schema Firestore

- `users/{uid}` — `{ uid, email, name, photoURL, role, createdAt }`
- `allowlist/{email}` — `{ email, role, turmaId, createdAt }`
- `turmas/{id}` — `{ name, icon, iconColor, startDate, endDate, students: string[], professors?: TurmaTeacher[], createdBy, createdAt }`
- `turmas/{id}/aulas/{id}` — `{ title, description, date, startTime, endTime, status, teachers: AulaTeacher[], driveLinks, attendance: { [email]: 'present'|'absent'|'late'|null }, attendanceCode?, avaliacoes?, bancoAulaId?, createdAt }`
- `turmas/{id}/aulas/{id}/respostas/{email}` — `{ studentEmail, studentName, answers: Record<avaliacaoId, string>, submittedAt }`
- `turmas/{id}/banco/{id}` — `{ title, description, teachers: AulaTeacher[], driveLinks, avaliacoes?, createdBy, createdAt }`

---

## Prioridades sugeridas

1. **Relatório de frequência** — visão admin/teacher com tabela por aluno
2. **Gerenciar matrículas na tela de edição da turma** — adicionar / remover alunos e professores direto na turma (hoje só dá pra fazer pelo perfil do usuário)
3. **Remover material** individual de uma aula / banco
4. **Formulário de inscrição** da landing page
5. **Deploy** — landing + platform em produção
