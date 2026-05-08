# MiniCommerce

Projeto full stack de um mini e-commerce com painel administrativo, autenticação, catálogo de produtos, categorias e pedidos.

## Estrutura

- `mini-commerce-web`: frontend em Next.js, React, TypeScript e Tailwind CSS.
- `MiniCommerce.Api`: backend em ASP.NET Core, Entity Framework Core, SQLite e JWT.

## Funcionalidades

- Login com token JWT.
- Dashboard com resumo de produtos e pedidos.
- CRUD de produtos.
- Criação e listagem de categorias.
- Criação, listagem e cancelamento de pedidos.
- Integração do frontend com a API via Axios.

## Como rodar a API

```powershell
cd MiniCommerce.Api
dotnet restore
dotnet ef database update
dotnet run
```

A API roda por padrão em:

```txt
http://localhost:5197
```

## Como rodar o frontend

```powershell
cd mini-commerce-web
npm install
npm run dev
```

O frontend roda por padrão em:

```txt
http://localhost:3000
```

## Configuração

O frontend usa a API configurada em:

```txt
mini-commerce-web/lib/api.ts
```

Por padrão:

```txt
http://localhost:5197/api
```

Para produção, configure uma chave JWT segura e uma string de conexão apropriada no ambiente da API.
