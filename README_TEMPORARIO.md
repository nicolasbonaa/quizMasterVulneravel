# QuizMaster API - Versão 1.0 (vulnerável)

API RESTful em Node.js + Express + Sequelize + MySQL, criada como ambiente de estudo para pentest em aplicações web. Esta versão foi desenvolvida para permitir testes de:

- SQL Injection
- XSS
- CSRF
- CRUD básico de usuários

> A intenção desta versão é demonstrar vulnerabilidades de forma didática para a etapa seguinte de correção e hardening.

## 1) Requisitos

- Node.js 18+
- MySQL 8+
- npm
- Banco com acesso local ou remoto

## 2) Configuração do ambiente

1. Clone o projeto e entre na pasta.
2. Instale as dependências:

```bash
npm install
```

3. Crie o banco de dados no MySQL:

```sql
CREATE DATABASE quizmaster_db;
```

4. Ajuste as variáveis de ambiente no arquivo `.env`:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_NAME=quizmaster_db
DB_USER=root
DB_PASSWORD=root

JWT_SECRET=trespratosdetrigoparatrestigrestristes
JWT_EXPIRES_IN=7d
```

5. Inicie a aplicação:

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

## 3) Endpoints da versão 1.0

### Base

- GET /api/

### Usuários

- GET /api/users
- GET /api/users/:id
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

### Autenticação

- POST /api/register
- POST /api/login
- POST /api/logout

### Perfil

- GET /api/profile/:username
- GET /api/profile/me
- PUT /api/profile/me

## 4) Exemplos de requisições com Postman

### 4.1 Listar usuários

```http
GET http://localhost:3000/api/users
```

### 4.2 Criar usuário

```http
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "username": "aluno1",
  "email": "aluno1@email.com",
  "password": "123456",
  "fullName": "Aluno Um",
  "bio": "Estudante de segurança"
}
```

### 4.3 Atualizar usuário

```http
PUT http://localhost:3000/api/users/1
Content-Type: application/json

{
  "username": "aluno_atualizado",
  "fullName": "Aluno Atualizado",
  "bio": "Novo perfil"
}
```

### 4.4 Excluir usuário

```http
DELETE http://localhost:3000/api/users/1
```

### 4.5 Registro

```http
POST http://localhost:3000/api/register
Content-Type: application/json

{
  "username": "demo",
  "email": "demo@email.com",
  "password": "123456",
  "confirmPassword": "123456",
  "fullName": "Usuário Demo"
}
```

### 4.6 Login

```http
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "login": "demo",
  "password": "123456"
}
```

## 5) Testes de vulnerabilidade (Versão 1.0)

### 5.1 SQL Injection

Use um payload no campo de login para tentar autenticação por bypass:

```http
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "login": "admin' OR '1'='1",
  "password": "' OR '1'='1"
}
```

A aplicação está intencionalmente vulnerável porque a autenticação faz consulta em SQL bruto sem parametrização.

### 5.2 XSS

Tente armazenar um script em um campo de texto do usuário:

```http
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "username": "xssuser",
  "email": "xss@email.com",
  "password": "123456",
  "fullName": "<script>alert('XSS')</script>",
  "bio": "<img src=x onerror=alert('XSS')>"
}
```

Ao listar ou consultar esse usuário, o payload pode ser refletido ou renderizado no navegador sem sanitização.

### 5.3 CSRF

A aplicação foi deixada sem proteção anti-CSRF para a etapa de pentest. Nesta etapa, o aluno deve criar uma página maliciosa em um servidor externo para enviar uma requisição de alteração sem o token anti-CSRF válido.

## 6) Estrutura do projeto

```text
.
├── app.js
├── .env
├── package.json
├── README.md
├── bin/
│   └── www
├── config/
│   ├── constants.js
│   ├── database.js
│   └── jwt.js
├── middlewares/
│   ├── apiResponse.js
│   ├── asyncHandler.js
│   ├── auth.js
│   ├── errorHandler.js
│   └── profileMulter.js
├── modules/
│   ├── search/
│   └── user/
├── public/
│   └── uploads/
├── routes/
│   └── index.js
└── examples/
    └── csrf-malicioso.html
```

## 7) Relatório Executivo

### Sumário Executivo

A versão 1.0 da API foi desenvolvida como ambiente didático para a demonstração de falhas comuns em aplicações web. A API apresenta vulnerabilidades em autenticação, validação e proteção de rotas, com foco em praticidade para exercícios de pentest. O objetivo principal é permitir que estudantes identifiquem e documentem riscos reais, incluindo injeção de SQL, execução de scripts em páginas e ausência de proteção contra CSRF.

A base do projeto deixa claro que a camada de segurança ainda não foi aplicada, tornando o ambiente adequado para análise ofensiva e posterior correção em versões futuras.

### Relatório Técnico

- Falha de autenticação: consulta SQL montada manualmente com interpolação direta de entrada do usuário.
- Falta de sanitização: campos como `fullName` e `bio` aceitam conteúdo HTML/JavaScript sem validação.
- Ausência de anti-CSRF: updates e deletes sensíveis podem ser disparados por uma página externa sem token de verificação.
- Ausência de hash de senha: as senhas são armazenadas em texto puro durante a etapa de vulnerabilidade.

## 8) Observações finais

- Esta é a versão intentionally vulnerable, indicada para estudo de pentest.
- Para a versão 2.0, o projeto deve incluir autenticação JWT, uso de `bcrypt`, validação de entrada e proteção de rotas.
- O uso desta API deve ocorrer apenas em ambiente local e para fins acadêmicos.
