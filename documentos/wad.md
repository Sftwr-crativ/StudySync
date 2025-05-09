# Documento de Análise e Desenvolvimento (WAD) - StudySync

## Introdução

O projeto **StudySync** foi desenvolvido como parte da disciplina COMP do módulo 2025-1B. Seu objetivo é estruturar a base de um sistema web no padrão MVC, utilizando Node.js com Express, além de projetar o banco de dados relacional que sustentará as operações futuras da aplicação.

A proposta do StudySync é fornecer uma plataforma que permita a grupos de estudo organizarem tarefas de forma colaborativa, com controle de status (Kanban) e visibilidade coletiva do progresso. A ênfase nesta fase foi na modelagem e implementação da estrutura base do backend e banco de dados, preparando o projeto para as próximas etapas.

---

## Diagrama do Banco de Dados

O banco de dados foi modelado utilizando PostgreSQL e projetado para refletir a lógica de colaboração entre usuários, grupos e tarefas. Ele inclui as seguintes tabelas principais:

* **Users**: cadastro dos usuários do sistema.
* **StudyGroups**: grupos criados por usuários.
* **GroupMembers**: tabela de associação entre usuários e grupos.
* **Tasks**: tarefas atribuídas a usuários dentro de grupos.
* **CalendarEvents**: eventos agendados nos grupos.
* **GroupSyncStatus**: view que mostra o nível de sincronização do grupo com base na conclusão das tarefas.

### Diagrama Relacional

<img src="C:\Users\eduar\OneDrive\Documentos\GitHub\StudySync\assets\diagrama.png"></img>

---

## Modelo Físico

O modelo físico foi implementado em SQL puro e está disponível no arquivo:

```
scripts/init.sql
```

Este script cria todas as tabelas, enum de status, triggers e a view utilizada para calcular a sincronização de tarefas nos grupos.