# Bulk File Processing ETL

Plataforma backend para processamento assíncrono e escalável de arquivos grandes (CSV), projetada para lidar com milhões de registros, com alta confiabilidade, controle de concorrência e observabilidade completa do processo.

O sistema implementa na prática um pipeline ETL distribuído, utilizando filas, workers paralelos e processamento em stream para garantir performance e estabilidade.

## Visão Geral da Arquitetura

A aplicação é composta por múltiplos serviços independentes:

- **API (NestJS)**
  - Responsável por receber uploads, criar jobs de processamento, expor endpoints de consulta e documentação Swagger.

- **Fila (BullMQ / Redis)**
  - Orquestra o processamento assíncrono, garante retry automático, controle de concorrência e tolerância a falhas.

- **Workers**
  - Processam arquivos em background, validam dados, executam transformações e persistem informações no banco.

- **Banco de Dados (PostgreSQL)**
  - Armazena dados processados, histórico de jobs, status..

Essa separação permite escalabilidade horizontal, isolamento de responsabilidades e alta disponibilidade.

## Diferenciais Técnicos

### Escalabilidade Horizontal de Workers

- Os workers são stateless e podem ser escalados horizontalmente sem qualquer alteração no código.
- Múltiplos workers podem processar arquivos diferentes em paralelo, respeitando a concorrência definida pela fila.

Isso permite:

- Processar vários uploads simultaneamente
- Aumentar throughput apenas adicionando novos containers
- Isolar falhas de um worker sem impactar o sistema inteiro

### Estratégia Genérica de Importação (Strategy Pattern)

- O sistema utiliza uma arquitetura baseada em estratégias, onde cada tipo de importação (ex: usuários, produtos, etc.) implementa uma interface.

Isso torna os workers:

- Genéricos (não acoplados a um domínio específico)
- Extensíveis sem modificar o core do processamento
- Capazes de processar qualquer tipo de CSV apenas registrando uma nova estratégia

### Processamento em Stream

- Arquivos são processados utilizando streams do Node.js, linha por linha, evitando o carregamento completo em memória.
- Baixo consumo de RAM
- Nenhum risco de travar o processo
- Suporte real a arquivos com mais de 1 milhão de linhas
- O sistema permanece responsivo mesmo sob carga pesada

### Inserção Performática no Banco

  - Batch inserts
  - Controle de tamanho de lote
  - Evita inserção linha a linha (extremamente lenta)

### Controle de Falhas e Retry Automático

  - Retry automático configurável
  - Diferencia falhas transitórias de falhas finais
  - Status do job atualizado corretamente
  - Nenhuma perda silenciosa de dados

### Histórico Completo de Jobs

- Cada importação mantém histórico detalhado:
  - Tipo de importação
  - Status atual
  - Total de linhas processadas
  - Path para o arquivo com os erros
  - Progresso percentual
  - Data de início e término

### Testes

  - Testes unitários para regras de validação e serviços
  - Testes de integração com worker
  - Testes com banco real utilizando Docker

### CI/CD e Containers

  - API, Worker e Fila como serviços independentes
  - Suporte a múltiplos workers em paralelo
  - Preparado para pipelines com testes paralelos
  - Deploy multi-serviço

### Documentação da API

  - A API é 100% documentada com Swagger
  - Visualização clara dos endpoints
  - Testes diretos via interface web
  - Contrato explícito da API