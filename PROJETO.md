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
| Busca / filtro na lista de usuários | ❌ |
| Deletar usuário | ❌ |

---

### Turmas
| Feature | Status |
|---------|--------|
| Listar turmas com ícone e cor | ✅ |
| Criar turma (nome, ícone, cor, datas, alunos) | ✅ |
| Editar turma | ✅ |
| Deletar turma | ❌ |
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
| Scroll no painel de conteúdo | ⚠️ bug pendente |

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
| Submissão real pelo aluno (salvar no Firestore) | ❌ |
| Ver respostas dos alunos (visão professor / admin) | ❌ |
| Feedback / correção de respostas abertas | ❌ |

---

### Frequência (Chamada)
| Feature | Status |
|---------|--------|
| Campo `attendance` modelado no tipo `Aula` | ✅ |
| UI para marcar chamada (presente / ausente / atrasado) | ❌ |
| Relatório de frequência por aluno | ❌ |

---

### Painel do Professor
| Feature | Status |
|---------|--------|
| Layout base com stats | ✅ (placeholder) |
| Minhas turmas (filtradas pelas turmas onde é professor) | ❌ |
| Próximas aulas do professor | ❌ |
| Gestão de aulas e materiais das suas turmas | ❌ |

---

### Painel do Aluno
| Feature | Status |
|---------|--------|
| Layout base | ✅ (placeholder) |
| Minhas turmas (turmas onde está matriculado) | ❌ |
| Ver aulas e materiais das suas turmas | ❌ |
| Submeter avaliações | ❌ |
| Consultar própria frequência | ❌ |

---

## Prioridades sugeridas

1. **Bug do scroll** no painel de conteúdo da turma
2. **Painel do aluno** — acesso às turmas, materiais e avaliações
3. **Submissão de avaliações** — salvar respostas do aluno no Firestore
4. **UI de frequência** — marcar chamada por aula
5. **Painel do professor** — minhas turmas e próximas aulas
6. **Gerenciar matrículas** — adicionar / remover alunos de uma turma
7. **Formulário de inscrição** da landing page
8. **Remover material** individual de uma aula
9. **Deletar turma**
10. **Filtro de usuários** no painel admin
11. **Deploy** — landing + platform em produção
