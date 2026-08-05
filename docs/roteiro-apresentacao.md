# Roteiro de apresentação — Portal de Renegociação de Dívidas

Use este material como guia de raciocínio. O objetivo não é decorar, mas conseguir justificar o escopo, as regras e as decisões técnicas.

## 1. Abertura

> Este projeto é um protótipo full stack para o desafio de renegociação de dívidas do Itaú. O cliente se autentica, visualiza dívidas, simula condições de pagamento e confirma um acordo.
>
> O desafio limitava a solução a duas telas. Escolhi **Dívidas** e **Simular proposta**. O login é um diálogo e a confirmação acontece dentro da própria simulação. Após o aceite, o cliente retorna à lista atualizada. Assim entreguei o fluxo sem ultrapassar o limite de telas.

O frontend usa Angular e o backend é um BFF Node.js com TypeScript. Os dados ficam em memória porque o objetivo é demonstrar jornada, arquitetura e regras sem exigir infraestrutura local.

## 2. Demonstração em cinco passos

### Login

Ao abrir o portal sem sessão, um diálogo solicita e-mail e senha. O BFF compara uma credencial fixa de demonstração e emite um JWT de 30 minutos.

- E-mail: `cliente.demo@email.com`
- Senha: `cliente9090@`

O token fica em `sessionStorage` e o interceptor adiciona `Authorization: Bearer` às chamadas. Isso é aceitável somente no protótipo. Em produção, a proposta usa Cognito com OAuth 2.0/OIDC e PKCE.

### Dívidas

A primeira tela mostra credor, produto, valor, vencimento e status. O endpoint não aceita um `clienteId` fornecido pelo navegador: ele usa a identidade extraída do JWT, reduzindo o risco de acesso horizontal indevido.

Dívidas ainda elegíveis exibem **Simular acordo**. Após a contratação, o card passa a mostrar saldo negociado, parcelas e próximo vencimento.

### Simulação

Na segunda tela, o cliente escolhe pagamento à vista ou parcelado e informa o primeiro vencimento. O frontend limita a data, mas o BFF também valida a regra para impedir manipulação da requisição.

O cálculo ocorre exclusivamente no backend:

- à vista: 18% de desconto;
- até 6 parcelas: 8%;
- até 12 parcelas: 4%;
- acima de 12 parcelas: sem desconto;
- validade da proposta: 15 minutos.

Valores são convertidos em centavos antes dos cálculos. Eventual diferença de arredondamento fica na última parcela, garantindo que a soma feche exatamente.

### Aceite

O primeiro clique solicita confirmação. Somente **Confirmar acordo** envia o aceite. O BFF verifica titularidade, validade, elegibilidade e compatibilidade do valor original.

O aceite é idempotente: repetir a mesma requisição retorna o acordo existente. O protótipo também serializa aceitações por dívida para impedir dois acordos concorrentes no mesmo processo.

### Comprovante

Depois do aceite, o cliente retorna à lista, onde a dívida passa a exibir o status **Em acordo**, o saldo negociado, as parcelas e o próximo vencimento. Não foi criada uma terceira tela.

## 3. Arquitetura do código

### Backend

- `presentation`: controllers, schemas HTTP e middleware de autenticação;
- `application`: casos de uso e regras de negócio;
- `domain`: entidades e portas;
- `infrastructure`: repositórios em memória e JWT;
- `composition`: criação da aplicação e injeção de dependências.

Os casos de uso dependem de interfaces. Assim, uma implementação DynamoDB ou uma integração com sistemas internos pode substituir a memória sem levar Express para o domínio.

### Frontend

- `core`: autenticação, guarda, interceptor e modelos;
- `shared/services`: comunicação com a API e estado compartilhado;
- `features/dividas`: lista e cards;
- `features/propostas`: simulação e confirmação do acordo.

Foram usados componentes standalone, Signals, Reactive Forms, carregamento lazy, change detection zoneless e Angular Material. Logout limpa o estado sensível, a rota de simulação possui guarda e uma resposta `401` encerra a sessão.

## 4. Arquitetura AWS proposta

> Escolhi uma arquitetura serverless proporcional ao desafio. A SPA fica em S3 privado, distribuída por CloudFront com OAC e AWS WAF. O comportamento `/api/*`, sem cache, encaminha a API para o API Gateway HTTP API.
>
> O Cognito autentica a SPA com Authorization Code e PKCE. O API Gateway valida o JWT e chama uma Lambda Node.js que exerce o papel de BFF. Propostas e acordos podem ficar no DynamoDB com KMS, point-in-time recovery, transações e escritas condicionais. CloudWatch recebe logs, métricas e alarmes.

### Por que Lambda em vez de Fargate?

O fluxo atual possui requisições curtas, baixo estado local e carga potencialmente variável. Lambda reduz recursos ociosos e dispensa ALB, VPC Link e gerenciamento de tarefas. Fargate seria reavaliado para carga sustentada, processamento contínuo, requisitos específicos de contêiner ou execução longa.

### Por que não usar Redis?

Não existe requisito atual de sessão de servidor nem evidência de gargalo de leitura. Adicionar ElastiCache criaria custo, invalidação de cache e mais uma dependência operacional sem benefício demonstrado.

### Por que DynamoDB?

Combina escala sob demanda e baixa administração com idempotência por escrita condicional. Se o modelo real exigir consultas relacionais complexas ou a instituição já possuir uma plataforma transacional, o BFF deve integrar o serviço oficial em vez de criar uma base paralela.

## 5. Segurança

O protótipo inclui:

- JWT nas rotas de negócio;
- filtro por cliente autenticado;
- guarda da rota de simulação;
- encerramento da sessão em `401`;
- limpeza de dados no logout;
- Zod e validações de negócio no backend;
- Helmet, CORS restrito, limite de corpo e rate limit;
- mensagens `500` sem detalhes internos.

Limites assumidos:

- credencial fixa, sem hash, cadastro, recuperação ou MFA;
- JWT no `sessionStorage` e HTTP local;
- repositórios e bloqueio de concorrência em memória;
- criação do acordo e atualização da dívida sem transação durável;
- ausência de APIs bancárias, boleto, Pix e provisionamento AWS reais.

Em produção, a identidade viria do Cognito, todo tráfego usaria HTTPS, a persistência teria escrita condicional/transacional e a integração financeira teria auditoria e idempotência duráveis.

## 6. Qualidade e validação

Antes da apresentação, execute:

```bash
npm --prefix backend test
npm --prefix frontend test
npm --prefix backend run lint
npm --prefix frontend run lint
npm --prefix backend run format:check
npm --prefix frontend run format:check
npm --prefix backend run build
npm --prefix frontend run build
```

Os testes cobrem cálculos, arredondamento, data de vencimento, titularidade, expiração, idempotência, concorrência, sessão, serviços Angular, confirmação e atualização do acordo. A auditoria de dependências e as contagens exatas devem ser confirmadas imediatamente antes da entrega.

## 7. Perguntas prováveis

### Por que calcular no backend?

Desconto, validade e arredondamento são regras financeiras e não podem depender de código controlado pelo navegador.

### Como evita dois acordos?

No protótipo, há bloqueio por dívida e idempotência por proposta. Em produção, usaria escrita condicional, transação e chave única na persistência, pois memória local não protege múltiplas instâncias.

### O projeto está pronto para produção?

Não. Ele é um protótipo demonstrativo, com limitações declaradas. A separação de responsabilidades facilita trocar autenticação, persistência e integrações sem reescrever as regras centrais.

### Por que somente duas telas se existe login e aceite?

Login é um diálogo sobre a lista, e o aceite acontece dentro da tela de simulação. As duas rotas de negócio continuam sendo `/dividas` e `/simular`.

### Por que os serviços AWS não aparecem no código?

O desafio solicita o desenho da arquitetura. O protótipo executa localmente; afirmar que os serviços estão provisionados seria incorreto. O desenho apresenta uma evolução possível e proporcional.

### Qual foi a parte mais crítica?

O aceite, porque muda estado financeiro. Por isso ele valida titularidade, validade, elegibilidade, valor original, idempotência e concorrência antes de criar o acordo.

## 8. Fechamento

> O projeto entrega as duas telas solicitadas e completa a jornada sem ampliar artificialmente o escopo. O principal cuidado foi manter cálculo e autorização no BFF, preservar consistência monetária e deixar claras as diferenças entre protótipo local e arquitetura de produção.
