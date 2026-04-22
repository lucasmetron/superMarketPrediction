# 🛒 E-commerce Recommendation System
> Sistema de recomendação inteligente utilizando Machine Learning com TensorFlow.js.

![NodeJS](https://img.shields.io/badge/Node.js-22.13.1-68a063?style=for-the-badge&logo=nodedotjs)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TensorFlow](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow)
![Browser-Sync](https://img.shields.io/badge/Browser--Sync-6379F2?style=for-the-badge&logo=browsersync&logoColor=white)

## 📋 Sobre o Projeto
Esta é uma aplicação web focada em experiência do usuário e análise de dados. O sistema exibe perfis de usuários e listagens de produtos, permitindo o rastreamento de compras em tempo real para alimentar futuros modelos de recomendação baseados em Machine Learning.

## ✨ Funcionalidades
- **Seleção de Perfil:** Visualização detalhada de usuários e alternância de contas.
- **Histórico de Compras:** Exibição de transações passadas carregadas via JSON.
- **Catálogo de Produtos:** Listagem dinâmica com funcionalidade "Comprar Agora".
- **Tracking:** Rastreamento de cliques e persistência de dados via `sessionStorage`.

## 🛠️ Estrutura de Arquivos
```bash
├── 📁 controller/   # Lógica de conexão entre View e Service
├── 📁 data/         # Arquivos JSON (Usuários e Produtos)
├── 📁 service/      # Regras de negócio e manipulação de dados
├── 📁 view/         # Classes de gerenciamento do DOM e templates
├── 📄 index.html    # Interface principal
└── 📄 index.js      # Ponto de entrada da aplicação

## 🚀 Como Executar
```bash
1. Pré-requisitos
Certifique-se de estar usando a versão estável do Node.js:

```bash
nvm install 22.13.1
nvm use 22.13.1

## 2. Instalação
Utilize o comando ci para uma instalação limpa e fiel ao package-lock.json:

```bash
npm ci

## 3. Iniciar Aplicação
```bash
npm start
Acesse no seu navegador: http://localhost:3000

Nota para Windows: O comando de start foi otimizado para evitar erros de sintaxe no PowerShell ao monitorar arquivos JSON e JS.


Desenvolvido como projeto de estudo em SuperMarket Prediction.