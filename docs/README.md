<h1 align="center">Mini Kanban</h1>
<p align="center">
  <strong>Desafio FullStack Veritas</strong>
</p>

<p align="center">
  <img src="https://github.com/eiKuan/desafio-fullstack-veritas/blob/main/docs/gitImages/boasVindass.png"/>
</p>

## <img src="https://github.com/user-attachments/assets/25bf4cc7-887c-4cb4-88d3-516c59ed4f9e" width="25" height="25"/> Visão geral do projeto

Este **Mini Kanban** é uma aplicação fullstack de organização de tarefas em colunas estilo Kanban (A fazer, Em andamento e Finalizado), com cartões arrastáveis (drag and drop) e um mascote reativo que reage à interação do usuário. O backend expõe uma API REST em Go sobre MySQL e persiste as tarefas, o frontend consome essa API e renderiza o board, os cards e o mascote. Tudo é containerizado em Docker. O projeto foi desenvolvido como desafio técnico da [Veritas](https://www.veritas.law/).

> Observação 1: Também existe uma persistência por JSONs em backend/storage (é criado após qualquer inserção de dados na aplicação).
> Observação 2: Todos os commits do repositório foram sobrescritos por conta de um git push --force 👍
---

## <img src="https://github.com/user-attachments/assets/ee2c5fe1-2dc2-44e6-a71d-19c38ae9958e" width="20" height="20"/> Sumário

- [Visão geral do projeto](#-visão-geral-do-projeto)
- [Funcionalidades](funcionalidades)
- [Tecnologias](tecnologias)
- [Arquitetura do projeto e Estrutura](arquitetura-e-estrutura)
- [Como inicializar o projeto](inicializar)
- [Documentação](documentação)
- [Limitações e melhorias futuras](limitacoes)

---
<h1 id="funcionalidades" align="center"> 
  <img src="https://github.com/user-attachments/assets/6a1fda23-dba1-4e2d-9d19-639d57aee1b7" width="25" height="25"/> Funcionalidades
</h1>
<p align="center">
  <img src="https://github.com/eiKuan/desafio-fullstack-veritas/blob/main/docs/gitImages/readmeVideoReSS.webp"/>
</p>

- **CRUD completo de tarefas**, com rotas `GET`, `POST`, `PUT` e `DELETE` em `/tasks`
- **Drag and drop** para mover tarefas entre colunas
- **Exclusão interativa**, com animação personalizada do mascote
- **Criação e edição de tarefas**, com validação de título, descrição, tag, prioridade e data limite
- **Reordenação automática** das posições das tarefas ao mover entre colunas
- **Indicadores visuais** de prioridade (Baixa, Média, Alta) e de dias restantes até a data limite

> Observação: Somente o título é obrigatório na criação de novas tarefas.

---

<h1 id="tecnologias" align="center"> 
  <img src="https://github.com/user-attachments/assets/c4feddda-98c3-40f8-8183-8605bd194c82" width="25" height="25"/> Tecnologias
  </h1>

<h3 align="center"> Backend e Infraestrutura </h3>
<p align="center">
  <img src="https://github.com/eiKuan/desafio-fullstack-veritas/blob/main/docs/gitImages/Backend_E_Infra_Banner.png"/>
</p>

| Tecnologia | Descrição |
|---|---|
| ![Go](https://img.shields.io/badge/go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white) | Construção da API REST com o framework **Gin v1.12.0** (Go 1.26.5), organizada em camadas `handlers` → `services` → `repository`. |
| ![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white) | Persistência dos dados via `database/sql` (sem ORM), com driver `go-sql-driver/mysql`; a tabela `tasks` é criada automaticamente na inicialização. |
| ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) | Orquestra backend, MySQL 8.4 e o Dbgate (inspetor de banco) via `docker-compose`, facilitando o ambiente de desenvolvimento. |


Outras tecnologias:
  - **DbGate** — Interface web para inspecionar, consultar e gerenciar banco de dados MySQL durante o desenvolvimento.

---
<h3 align="center"> Frontend </h3>
<p align="center">
  <img src="https://github.com/eiKuan/desafio-fullstack-veritas/blob/main/docs/gitImages/frontend.png"/>
</p>

### <img src="https://github.com/user-attachments/assets/f2df4a06-c38f-4631-a848-a81cbed9e0b7" width="20" height="20"/> Desenvolvimento assistido por IAs

O frontend foi desenvolvido de forma amplamente assistida por Inteligência Artificial utilizando ferramentas em ambiente CLI. A maior parte da modelagem inicial dos componentes, estrutura do projeto, refatorações e geração de código foi realizada com o auxílio do OpenCode em conjunto com o 9router, enquanto as decisões de arquitetura, design, validação das implementações, revisões e ajustes finais permaneceram sob supervisão e validação do desenvolvedor.

| Tecnologia | Descrição |
|---|---|
| ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) | Construção da interface web com **React 18** + **Vite 6** (renderização via `react-dom`, roteamento com `react-router-dom`). |
| ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) | Tipagem estrita em todo o frontend, com DTOs e entidades que refletem o contrato da API. |
| **OpenCode**| Agente de desenvolvimento em CLI orientado por Inteligência Artificial, utilizado para acelerar a implementação, refatoração e geração de código. |
| **9Router**| Agente de roteamento e orquestração de modelos de IA em ambiente CLI. |

Outras bibliotecas completam o frontend:
  - **TailwindCSS 4** — estilização utility-first via plugin.
  - **Axios** — cliente HTTP para consumo da API REST.
  - **TanStack Query (React Query)** — gerenciamento de estado servidor.
  - **React Hook Form + Zod** — formulários do modal de tarefas com validação por schema.
  - **Framer Motion** — animações de cards e transições.
  - **Lucide React** — ícones da interface.
  - **React Router DOM** — roteamento das páginas.

---
<h2 id="arquitetura-e-estrutura" align="center"> 
  <img src="https://github.com/user-attachments/assets/c5bc9026-a82f-4718-a24c-0d1139616a18" width="25" height="25"/> Arquitetura do projeto e Estrutura
</h2>

O projeto separa **backend** (Go, Gin) e **frontend** (React web, consumidor da API), cada um com sua própria arquitetura em camadas:

- **Backend:** `handlers` (controllers Gin) → `services` (casos de uso) → `repository` (SQL manual) → `model` (entidades). Cada camada depende estritamente da anterior.
- **Frontend:** `Componente` → `Hook` (TanStack Query) → `Service` → `Axios` → `Backend`. Organizado em `components/`, `hooks/`, `services/`, `pages/`, `contexts/` e `utils/`.
 
### <img src="https://github.com/user-attachments/assets/1d62b804-0316-4026-a0d6-7d18ab852b27" width="20" height="20"/> Endpoints

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/tasks` | Retorna todas as tarefas |
| `GET` | `/tasks/:taskId` | Retorna uma tarefa específica |
| `POST` | `/tasks` | Adiciona uma nova tarefa |
| `PUT` | `/tasks/:taskId` | Atualiza uma tarefa existente |
| `DELETE` | `/tasks/:taskId` | Remove uma tarefa |

### <img src="https://github.com/user-attachments/assets/6484a3e8-b8ad-4540-a28a-001fec1871b0" width="20" height="20"/> Template JSON
```json
{
  "id": 1,
  "title": "Implementar autenticação",
  "description": "Adicionar login com JWT",
  "column_type": 0,
  "column_position": 1,
  "tag": "backend",
  "priority": 2,
  "due_date": "2026-08-07",
  "completed": false
}
```

### <img src="https://github.com/user-attachments/assets/1ffa3d29-40f9-46e6-885e-b97301d60cfc" width="20" height="20"/> Estrutura de diretórios

```text
desafio-fullstack-veritas/
├── backend/                  # Go + Gin (API REST)
│   ├── main.go               # wiring de rotas e dependências
│   ├── handlers/             # controllers Gin (/tasks)
│   ├── services/             # casos de uso
│   ├── repository/           # SQL manual
│   ├── model/                # entidades
│   ├── db/                   # conexão MySQL e Inicialização de tabelas
│   ├── middleware/           # CORS (configurável via CORS_ALLOWED_ORIGIN)
│   ├── storage/              # persistências em JSONs
│   ├── Dockerfile             # imagem do backend
│   └── .dockerignore
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/       # tudo o que compõe o Kanban
│   │   ├── hooks/            # useTasks (TanStack Query)
│   │   ├── services/         # axios + API
│   │   ├── pages/            # KanbanPage
│   │   ├── contexts/         # DragDropContext
│   │   ├── utils/            # helpers de tasks (colunas, posições)
│   │   ├── assets/           # imagens e vídeos do mascote/cards
│   │   └── types.ts          # DTOs e entidades (espelha o backend)
│   ├── Dockerfile            # imagem do frontend (Vite dev server)
│   └── .dockerignore
├── docs/
│   ├── README.md
│   └── flows/                 # userflow e dataflow
├── docker-compose.yaml       # frontend, backend, mysql, dbgate
└── .env.example              # template de variáveis
```

---

<h2 id="inicializar" align="center"> 
  <img src="https://github.com/user-attachments/assets/eae933f5-1ca8-4a2f-a99f-6344dbfbd465" width="25" height="25"/> Como inicializar o projeto
</h2>

#### Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) (recomendado) — sobe todos os serviços (frontend, backend, MySQL e Dbgate) com um único comando.
- **Ou**, para rodar fora do Docker: Go 1.26.5 + MySQL 8.4 locais para o backend e Node.js 18+ com npm para o frontend.

#### 1. Clonar o repositório

```bash
git clone https://github.com/eiKuan/desafio-fullstack-veritas.git
cd desafio-fullstack-veritas
```

#### 2. Configurar variáveis de ambiente

Copie o template e ajuste os valores conforme seu ambiente:

```bash
cp .env.example .env
```

Principais variáveis (ver `.env.example`):

| Variável | Descrição |
|---|---|
| `DB_HOST` | `mysql` dentro do Docker; `localhost` para rodar o backend localmente |
| `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Credenciais do MySQL |
| `BACKEND_PORT` | Porta exposta do backend (padrão `8080`) |
| `FRONTEND_PORT` | Porta exposta do frontend (padrão `5173`) |
| `CORS_ALLOWED_ORIGIN` | Origem permitida pelo CORS do backend (padrão `http://localhost:5173`) |
| `MYSQL_PORT`, `DBGATE_PORT` | Portas do MySQL e do Dbgate |

#### 3. Subir todos os serviços (Docker)

```bash
docker compose up --build
```

Sobe **todos os serviços** com um único comando:

| Serviço | Descrição | Porta |
|---|---|---|
| `frontend` | Frontend React + Vite (dev server com HMR) | `:5173` |
| `backend` | API REST em Go + Gin | `:8080` |
| `mysql` | MySQL 8.4 | `:3306` |
| `dbgate` | Inspetor de banco de dados | `:3000` |

O frontend é servido em `http://localhost:5173` e consome a API em `http://localhost:8080` por padrão (a URL é injetada automaticamente via variável `VITE_API_URL` no `docker-compose.yaml`).

> O Vite dev server roda dentro do container com bind em `0.0.0.0:5173`, garantindo que o HMR func corretamente ao acessar pelo navegador.

#### 4. Rodar o frontend localmente (opcional)

Caso queira rodar o frontend fora do Docker (apenas para desenvolvimento frontend isolado):

```bash
cd frontend
npm install
npm run dev
```

> Observação: o CORS do backend permite a origem configurada em `CORS_ALLOWED_ORIGIN` (padrão `http://localhost:5173`); ao servir o frontend em outra origem é necessário ajustar essa variável no `.env`.

---

<h1 id="documentacao" align="center"> 
  <img src="https://github.com/user-attachments/assets/0d3922bb-7f46-4758-aa12-41875b326126" width="25" height="25"/> Documentação 
</h1>
<p align="center">
  <img src="https://github.com/eiKuan/desafio-fullstack-veritas/blob/main/docs/gitImages/documentacao.png"/>
</p>

- **Userflow**: [docs/flows/userFlow.png](./flows/userFlow.png)
- **Dataflow ( DFD Level 0/1 )**: [docs/flows/dataflow.png](./flows/dataFlow.png)

---

<h1 id="limitacoes" align="center"> 
  <img src="https://github.com/user-attachments/assets/fcd0257f-87dd-4d3f-92f2-f337dce0ed29" width="25" height="25"/> Limitações conhecidas e melhorias futuras 
</h1>
<p align="center">
  <img src="https://github.com/eiKuan/desafio-fullstack-veritas/blob/main/docs/gitImages/limitEmelhor.png" width="400" height="500"/>
</p>

### <img src="https://github.com/user-attachments/assets/bc57f1e6-2b5e-455c-830e-20ce8b204b5d" width="20" height="20"/> Limitações conhecidas
- **Redimensionamento:** alguns componentes ainda apresentam comportamentos inconsistentes em diferentes tamanhos de tela.
- **CardList:** a implementação atual pode ser otimizada em organização, desempenho e responsividade.
- **Animações e fluidez:** transições e animações ainda precisam de ajustes para proporcionar uma experiência mais natural.
- **Interface (UI):** alguns elementos visuais ainda necessitam de refinamentos para melhorar a consistência e usabilidade.
### <img src="https://github.com/user-attachments/assets/d912c7c5-54d0-4227-93a2-e5b49a843745" width="20" height="20"/> Melhorias futuras
- **Segurança no back-end:** implementar e fortalecer lógicas de autenticação, autorização e validação para maior segurança da aplicação.
- **Polimento do código:** refatorar trechos da aplicação, melhorar a organização da arquitetura e aumentar a legibilidade e manutenibilidade do projeto.
- **Melhorias na interface:** aperfeiçoar componentes visuais, responsividade e experiência do usuário.
- **Otimização de desempenho:** melhorar a renderização de listas, animações e o desempenho geral da aplicação.


---

<p align="center">Desenvolvido por <a href="https://github.com/eiKuan">eiKuan</a> como desafio técnico para a Veritas.</p>
