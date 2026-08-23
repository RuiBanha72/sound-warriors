# Family PWA

PWA familiar privada para centralizar horario escolar, calendario letivo, ferias, eventos, tarefas e rotinas.

## MVP

- Pagina Hoje
- Horario semanal
- Calendario escolar
- Ferias, feriados e dias sem aulas
- Eventos e testes
- Tarefas familiares
- Rotinas e itens a levar
- Instalacao como PWA

## Arquitetura prevista

- Frontend: HTML/CSS/JavaScript, mobile-first
- PWA: manifest + service worker
- Backend: Cloudflare Workers / Pages Functions
- Base de dados: Cloudflare D1
- Autenticacao: acesso privado da familia

## Estrutura futura

- `children`
- `users`
- `school_schedule`
- `school_calendar`
- `events`
- `tasks`
- `routines`
- `routine_items`
- `documents`
- `notification_preferences`

Este diretorio foi criado inicialmente numa branch separada do repositorio Sound Warriors apenas para arrancar o desenvolvimento sem interferir com a aplicacao existente. A publicacao deve ser feita como projeto Cloudflare separado.
