# Catadores Digitais — Estado do Projeto

## Stack

| Projeto | Tecnologias |
|---------|------------|
| Landing | Vite + React + TypeScript + Tailwind + Framer Motion |
| Platform | Next.js 15 (App Router) + Firebase (Auth + Firestore) + Tailwind |

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
| Busca / filtro na lista de usuários | ✅ |
| Paginação de 10 usuários por página | ✅ |
| Deletar usuário (com confirmação inline) | ✅ |
| Allowlist: adicionar / remover emails com role | ✅ |
| UserDetailPanel (slide-over de detalhes do usuário) | ✅ |

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
| Gerenciar alunos matriculados (adicionar / remover) | ❌ |

---

### Aulas
| Feature | Status |
|---------|--------|
| CalendarGrid — grade mensal de aulas | ✅ |
| Sincronização de mês entre calendário e painel de conteúdo | ✅ |
| Criar aula (data, horário, título, descrição, professores) | ✅ |
| Editar aula | ✅ |
| Deletar aula | ✅ |
| Calendário colapsável com FAB para reabrir | ✅ |
| Página individual de aula (`/dashboard/aula/[turmaId]/[aulaId]`) | ✅ |

---

### Banco de Aulas
| Feature | Status |
|---------|--------|
| Criar aula no banco (`turmas/{id}/banco/{bancoId}`) | ✅ |
| Editar / deletar aula do banco | ✅ |
| Agendar aula do banco para uma data (`/api/turmas/[id]/banco/[bancoId]/agendar`) | ✅ |
| Painel BancoPanel com lista e modal de criação/edição | ✅ |
| AgendarBancoModal para escolher data e horário ao agendar | ✅ |

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
| Ver respostas dos alunos (visão professor / admin) | ❌ |
| Feedback / correção de respostas abertas | ❌ |

---

### Frequência (Chamada)
| Feature | Status |
|---------|--------|
| Campo `attendance` no tipo `Aula` | ✅ |
| `attendanceCode` — código de 4 dígitos gerado pelo professor | ✅ |
| Aluno responde chamada com código via `AulaModal` | ✅ |
| API `/api/turmas/[id]/aulas/[aulaId]/chamada` (POST) | ✅ |
| API `/api/student/frequencia` — percentual de presença do aluno | ✅ |
| UI para marcar chamada manualmente (P/F/A pelo professor) | ❌ |
| Relatório de frequência por aluno (visão admin/teacher) | ❌ |

---

## Rotas API (plataforma)

| Rota | Método | Acesso |
|------|--------|--------|
| `/api/auth/session` | POST | público |
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
- `allowlist/{email}` — `{ email, role, createdAt }`
- `turmas/{id}` — `{ name, icon, iconColor, startDate, endDate, students: string[], professors?: TurmaTeacher[], createdBy, createdAt }`
- `turmas/{id}/aulas/{id}` — `{ title, description, date, startTime, endTime, status, teachers: AulaTeacher[], driveLinks, attendance: { [email]: 'present'|'absent'|'late'|null }, attendanceCode?, avaliacoes?, bancoAulaId?, createdAt }`
- `turmas/{id}/aulas/{id}/respostas/{email}` — `{ studentEmail, studentName, answers: Record<avaliacaoId, string>, submittedAt }`
- `turmas/{id}/banco/{id}` — `{ title, description, teachers: AulaTeacher[], driveLinks, avaliacoes?, createdBy, createdAt }`

---

## Prioridades sugeridas

1. **Ver respostas dos alunos** — painel professor/admin para consultar respostas por aula
2. **UI de chamada manual** — professor marca P/F/A diretamente (sem código)
3. **Relatório de frequência** — visão admin/teacher com tabela por aluno
4. **Gerenciar matrículas** — adicionar / remover alunos de uma turma
5. **Remover material** individual de uma aula / banco
6. **Formulário de inscrição** da landing page
7. **Deploy** — landing + platform em produção
