# 🧁 Muni Moldes - Website (Monorepo)

Este repositório contém o código-fonte do projeto Muni Moldes, uma fábrica de moldes de silicone artesanais para confeitaria e artesanato.

## 📂 Estrutura do Monorepo

O projeto é um monorepo que contém:

- **`frontend-moldes/`**: O site institucional e futuro e-commerce (React).
- **`backend-moldes/`**: A API de gerenciamento do catálogo e pedidos (NestJS).

## 🛠️ Tecnologias Utilizadas

### Frontend (`frontend-moldes`)

- **React (Vite)**: Biblioteca para construção da interface.
- **TypeScript**: Para tipagem estática e código mais seguro.
- **Tailwind CSS**: Framework de CSS utilitário para estilização rápida e responsiva.
- **React Router DOM**: Para gerenciamento de rotas e navegação.

### Backend (`backend-moldes`)

- **NestJS**: Framework Node.js para a API.
- **PostgreSQL**: Banco de dados relacional.
- **TypeORM**: ORM para interação com o banco de dados.
- **Docker**: Para gerenciamento do contêiner do PostgreSQL.

## 🚀 Como Rodar o Frontend

1.  **Pré-requisito**: Certifique-se de ter o Node.js instalado (versão LTS recomendada).

2.  Navegue até a pasta do frontend:
    ```bash
    cd frontend-moldes
    ```

3.  Instale as dependências:
    ```bash
    npm install
    ```

4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

5.  Acesse no navegador:
    O terminal mostrará o link para acessar a aplicação, geralmente `http://localhost:5173`.

## 🎨 Estilização e Identidade Visual

A paleta de cores da marca está configurada no arquivo `frontend-moldes/tailwind.config.js`:

- **Rosa (`munipink`)**: Destaques e Botões.
- **Verde (`munigreen`)**: Detalhes e Acentos.
- **Marrom Escuro (`munidark`)**: Textos e Títulos.
- **Bege (`munilight`)**: Fundos suaves.

---
*Desenvolvido para Muni Moldes* 🎨