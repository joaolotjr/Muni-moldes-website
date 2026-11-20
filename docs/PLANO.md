# Muni Moldes: plano de evolução

Plano das mudanças que faltam, do que restou de segurança até o acabamento.
Escrito em 17/11/2026 para avaliação do João. Nada aqui foi implementado ainda.

## Como ler este plano

Cada item segue a mesma estrutura:

- **Situação atual**: o que existe hoje no código.
- **Objetivo**: o que muda para quem usa.
- **Passo a passo**: as alterações, com os arquivos envolvidos.
- **Dicas e cuidados**: armadilhas conhecidas.
- **Como testar**: o que precisa passar para o item ser dado como pronto.
- **Melhorias futuras**: o que fica de fora de propósito.

Os tamanhos (P, M, G) são estimativas de esforço minhas, não medições:
P é coisa de uma sessão curta, M de uma sessão longa, G de mais de uma sessão.

Os nomes de arquivo são relativos à raiz do repositório.

---

## Andamento (18/11/2026)

- **Fase A**: concluída e no `main` (PRs #2, #3 e #4). O item 0.3 não se aplica: a cópia local
  do `docker-compose.yml` foi alterada pelo painel do servidor de desenvolvimento e fica como está,
  fora do git.
- **Fase B**: concluída e no `main` (PR #5: itens 3.1, 3.2, 3.8, 3.3, 3.7 e 3.4).
- Falta: fases C, D e E. A fase C depende da escolha de hospedagem e domínio (item 2.1).

## 0. Ponto de partida

### 0.1 O que já está pronto

| Área | Situação |
|---|---|
| Catálogo público, notícias, contato | Pronto, no visual do Stitch |
| Painel: produtos, categorias, notícias, configurações | Pronto |
| Usuários, permissões por área, saída por inatividade | Pronto |
| Compactação automática de fotos | Pronto |
| Limite de login, CORS, cabeçalhos, cookie de sessão, registro de atividades | Pronto |
| Validação de campos de produtos e categorias | Pronto |
| Testes do backend | 210 passando |

### 0.2 Branches empilhadas (resolver antes de tudo)

O `main` só tem o que entrou pelo PR #1. O restante está em branches criadas uma
em cima da outra, nesta ordem:

1. `claude/design-stitch` (PR #2, aberto)
2. `claude/usuarios-permissoes`
3. `claude/compactar-fotos`
4. `claude/seguranca`
5. `claude/validacao-campos`

**Recomendação:** antes de começar qualquer item deste plano, levar tudo para o
`main`. Duas formas:

- **Um PR só**, de `claude/validacao-campos` para o `main`, que contém as cinco.
  É o mais simples. O PR #2 pode ser fechado, pois fica contido.
- **Cinco PRs em sequência**, mesclando um de cada vez. Dá um histórico mais
  organizado, mas é mais trabalho e não muda o resultado.

Enquanto isso não for feito, cada nova branch aumenta a pilha e o risco de
conflito.

### 0.3 Pendência no `docker-compose.yml`

O arquivo na pasta de trabalho foi substituído por uma versão "expandida" (saída
de `docker compose config`), com os segredos do Garage em texto puro e caminhos
absolutos desta máquina. A versão correta está em `docker-compose.yml.bak` e no
git. Não foi commitado, mas precisa ser restaurado antes do item 2.3, que mexe
nesse arquivo:

```bash
git checkout docker-compose.yml && rm docker-compose.yml.bak
```

Confirmar com o João antes de rodar, caso a troca tenha sido intencional.

### 0.4 Ordem sugerida de execução

| Fase | Itens | Por quê |
|---|---|---|
| A. Arrumar a casa | 0.2, 0.3, 2.8 (CI) | Base estável e verificação automática para tudo que vem depois |
| B. Vender mais | 3.1, 3.2, 3.8, 3.3, 3.7, 3.4 | É o que mais muda o valor do site para o cliente |
| C. Ir ao ar | 2.1 a 2.7, 1.1 | Publicar com HTTPS, migrações e backup |
| D. Ser encontrado | 4.1 a 4.5 | Só faz sentido com o site no ar e com domínio |
| E. Acabamento | 5.x, 1.2 a 1.4, 3.5, 3.6 | Melhorias que não bloqueiam o lançamento |

A fase B pode trocar de lugar com a C se a prioridade for publicar logo.

---

## 1. Segurança: o que restou

### 1.1 HTTPS — tamanho P (dentro do deploy)

**Situação atual.** Tudo roda em HTTP. O cookie de sessão já está preparado: com
`NODE_ENV=production` ele ganha o atributo `Secure` e só trafega por HTTPS. A API
já envia o cabeçalho HSTS (via `helmet`), que só tem efeito sob HTTPS.

**Objetivo.** Senha e sessão nunca trafegarem em texto puro.

**Passo a passo.**

1. Colocar um proxy reverso na frente do site e da API. Recomendo o **Caddy**,
   porque obtém e renova o certificado sozinho, sem configuração extra.
2. Servir site e API **no mesmo domínio**, com a API em um caminho:
   `https://www.munimoldes.com.br` para o site e
   `https://www.munimoldes.com.br/api` para a API. Detalhes no item 2.3.
3. No `.env` de produção: `NODE_ENV=production`,
   `CORS_ORIGINS=https://www.munimoldes.com.br`, `TRUST_PROXY=1`.
4. No frontend, definir `VITE_API_URL=/api` no build de produção.

**Dicas e cuidados.**

- Mesmo domínio para site e API é o que mantém o cookie `SameSite=Strict`
  funcionando. Com a API em outro domínio registrado, o navegador deixaria de
  enviar o cookie.
- `TRUST_PROXY=1` é obrigatório atrás do proxy. Sem ele, todo acesso parece vir
  do IP do proxy e o limite de tentativas de login bloquearia todos os usuários
  de uma vez.
- Se a hospedagem for o Pi em casa com Cloudflare Tunnel (item 2.1), o HTTPS é
  fornecido pela Cloudflare e o Caddy fica só como roteador interno.

**Como testar.**

- `http://` redireciona para `https://`.
- No navegador, o cookie `mm_session` aparece com `Secure` e `HttpOnly`.
- Login, upload de foto e saída por inatividade funcionam pelo domínio.
- Avaliação no SSL Labs (ssllabs.com/ssltest) sem alertas graves.

**Melhorias futuras.** Incluir o domínio na lista de pré-carregamento de HSTS,
depois de alguns meses estável.

### 1.2 Bloqueio de login que sobrevive a reinício — tamanho P

**Situação atual.** A contagem de tentativas fica na memória da API
(`ThrottlerModule` em `app.module.ts`). Reiniciar a API zera tudo. Se um dia
houver mais de uma instância da API, cada uma conta separado.

**Objetivo.** O bloqueio de 15 minutos valer mesmo que a API reinicie.

**Passo a passo.**

1. Criar `backend-moldes/src/security/throttler-storage.ts` implementando a
   interface `ThrottlerStorage` do `@nestjs/throttler`, gravando em uma tabela
   `rate_limits` (chave, contador, expira_em, bloqueado_ate) no Postgres.
2. Registrar essa classe na opção `storage` do `ThrottlerModule.forRoot`.
3. Limpar as linhas vencidas na mesma rotina de limpeza do item 1.4.

**Dicas e cuidados.**

- A interface do `ThrottlerStorage` mudou entre versões da biblioteca. Conferir a
  assinatura em `node_modules/@nestjs/throttler/dist/throttler-storage.interface.d.ts`
  antes de escrever.
- Cada requisição passaria a fazer uma escrita no banco. Para o volume deste
  site é aceitável; a alternativa clássica é Redis, que seria mais um serviço
  para manter.
- Vale aplicar o armazenamento persistente só ao limite de login e deixar o
  limite geral (600 por minuto) em memória, para não escrever no banco a cada
  página vista.

**Como testar.** Errar a senha 10 vezes, reiniciar a API, tentar de novo: deve
continuar bloqueado. Teste automático da classe com um repositório simulado.

**Melhorias futuras.** Bloqueio também por conta (e-mail), para barrar ataques
distribuídos por vários IPs. Tem um custo: alguém que saiba o e-mail do
administrador consegue trancá-lo de propósito. Só vale junto com um meio de
desbloqueio.

### 1.3 Invalidar a sessão no logout — tamanho P

**Situação atual.** O logout apaga o cookie, mas o token em si continua válido
até vencer (no máximo 6 minutos). Uma cópia do token ainda funcionaria nesse
intervalo. O mesmo vale para a troca de senha: sessões abertas em outros
aparelhos continuam até vencer.

**Objetivo.** Sair, trocar a senha ou ter a senha redefinida encerra todas as
sessões daquela conta na hora.

**Passo a passo.**

1. `users/entities/user.entity.ts`: nova coluna `session_version` (inteiro,
   padrão 0).
2. `auth/auth.service.ts`: incluir a versão no token (`{ sub, v }`).
3. `auth/jwt.strategy.ts`: como o usuário já é consultado a cada requisição,
   basta recusar quando `payload.v` for diferente de `user.session_version`.
4. Incrementar `session_version` em três pontos: `POST /auth/logout`, troca da
   própria senha (`changeOwnPassword`) e redefinição de senha por um
   administrador (`UsersService.update` quando vem `password`).
5. Na troca da própria senha, emitir um cookie novo para a sessão atual não
   cair junto.

**Dicas e cuidados.**

- Incrementar no logout derruba a pessoa em todos os aparelhos, não só no
  atual. Para um painel administrativo isso é desejável, mas deve ser dito na
  tela ("Você saiu de todos os dispositivos").
- Tokens emitidos antes da mudança não têm `v`. Tratar `undefined` como 0 para
  não derrubar todo mundo na atualização.

**Como testar.** Entrar em dois navegadores, sair em um, verificar que o outro
cai na próxima requisição. Testes automáticos no `jwt.strategy.spec.ts` e no
`auth.controller.spec.ts`.

**Melhorias futuras.** Tela "Sessões ativas" em Minha conta, com aparelho e
último acesso. Exigiria guardar cada sessão em tabela, em vez de só um contador.

### 1.4 Limpeza automática dos registros — tamanho P

**Situação atual.** A tabela `audit_logs` só cresce.

**Objetivo.** Guardar um período definido e apagar o resto sozinho.

**Passo a passo.**

1. Instalar `@nestjs/schedule` e registrar `ScheduleModule.forRoot()` no
   `app.module.ts`.
2. Em `audit/audit.service.ts`, um método com `@Cron` diário que apaga registros
   mais antigos que `AUDIT_RETENTION_DAYS` (sugestão de padrão: 365).
3. Documentar a variável no `.env.example`.
4. Reaproveitar a mesma rotina para a tabela `rate_limits` do item 1.2.

**Dicas e cuidados.** Com mais de uma instância da API, a tarefa rodaria em
todas. Apagar por data é idempotente, então não causa problema.

**Como testar.** Teste automático chamando o método com registros de datas
diferentes. Em produção, conferir o log da primeira execução.

**Melhorias futuras.** Exportar o registro em CSV pela tela de Atividades, e
paginação nessa tela (hoje mostra só as 300 mais recentes).

### 1.5 Outros reforços, por ordem de valor

| Item | O que é | Tamanho |
|---|---|---|
| Atualizações automáticas | Ativar o Dependabot no GitHub para abrir PRs de atualização de dependências e alertas de vulnerabilidade | P |
| Política de segurança do site | Enviar `Content-Security-Policy` também para o frontend, pelo proxy. Hoje só a API envia | P |
| Senhas vazadas | Recusar senhas que aparecem em vazamentos conhecidos, consultando o serviço Have I Been Pwned (envia só um trecho do hash, não a senha) | P |
| Verificação em duas etapas | Código de aplicativo autenticador para quem tem a permissão "Usuários" | M |
| Recuperação de senha por e-mail | Hoje só outro administrador redefine. Exige serviço de envio de e-mail | M |

---

## 2. Operação: para ir ao ar

### 2.1 Escolher a hospedagem — decisão do João

Nada do resto da seção 2 pode ser finalizado sem esta escolha. As três opções
realistas:

| Opção | Custo | Vantagens | Desvantagens |
|---|---|---|---|
| **VPS** (servidor virtual alugado) | Mensalidade baixa | Controle total; o mesmo `docker compose` do desenvolvimento; IP fixo | Você cuida de atualizações e backup |
| **Pi em casa + Cloudflare Tunnel** | Só o domínio | Sem mensalidade; HTTPS e proteção da Cloudflare incluídos; não abre portas no roteador | Depende da sua internet e energia; o site cai se o Pi cair |
| **Plataforma gerenciada** (Railway, Render, Fly.io e similares) | Varia com o uso | Deploy automático a cada push; pouco trabalho de servidor | Banco e armazenamento de fotos cobrados à parte; menos controle |

**Minha recomendação:** VPS, por ser o caminho mais próximo do que já roda no Pi
e por não depender da conexão de casa para um site comercial. O Pi com
Cloudflare Tunnel é uma boa etapa intermediária para mostrar o site aos primos
antes de contratar qualquer coisa.

Não pesquisei preços atuais de nenhuma dessas opções; vale conferir antes de
decidir.

**Também é preciso decidir:** o domínio (por exemplo `munimoldes.com.br`, a
registrar no registro.br) e onde ficam as fotos em produção (item 2.4).

### 2.2 Imagens Docker do site e da API — tamanho M

**Situação atual.** Não há Dockerfile. Site e API rodam como processos avulsos
(`node dist/main.js` e `npx vite`), que caem quando a sessão termina.

**Objetivo.** Uma imagem para a API e uma para o site, iguais em
desenvolvimento e produção.

**Passo a passo.**

1. `backend-moldes/Dockerfile`, em duas etapas:
   - etapa de build: `node:26-slim`, `npm ci`, `npm run build`;
   - etapa final: `node:26-slim`, só dependências de produção
     (`npm ci --omit=dev`) e a pasta `dist`; usuário sem privilégios;
     `CMD ["node", "dist/main.js"]`.
2. `frontend-moldes/Dockerfile`, em duas etapas:
   - build: `node:26-slim`, `npm ci`, `npm run build` com
     `VITE_API_URL` recebido como argumento;
   - final: imagem do Caddy servindo a pasta `dist`.
3. `.dockerignore` nas duas pastas: `node_modules`, `dist`, `.env`, `uploads`.
4. `GET /health` na API (`app.controller.ts`), que responde 200 e confere a
   conexão com o banco. Usado pelo Docker e pelo monitoramento.

**Dicas e cuidados.**

- O `sharp` (compactação de fotos) baixa binários por arquitetura. A imagem tem
  que ser construída para a arquitetura do servidor: o Pi é ARM64, a maioria
  dos VPS é x86-64. Construir no próprio servidor ou usar `docker buildx`.
- Preferir `node:26-slim` (Debian) a Alpine: o `sharp` e o `bcrypt` têm menos
  surpresas.
- O site é um aplicativo de página única: o servidor precisa devolver o
  `index.html` para qualquer caminho desconhecido (`try_files` no Caddy), senão
  recarregar `/catalogo` dá 404.
- Nunca copiar o `.env` para dentro da imagem.

**Como testar.** `docker build` das duas imagens; subir com `docker run` e
conferir `/health`, a home e um recarregamento em `/catalogo`.

### 2.3 Composição de produção com proxy — tamanho M

**Situação atual.** O `docker-compose.yml` só tem Postgres e Garage.

**Objetivo.** Um comando sobe tudo, com reinício automático e HTTPS.

**Passo a passo.**

1. Manter o `docker-compose.yml` para desenvolvimento e criar
   `docker-compose.prod.yml` com cinco serviços: `caddy`, `web` (site), `api`,
   `postgres_db` e o armazenamento de fotos, todos com `restart: always`.
2. `Caddyfile` na raiz:

   ```
   www.munimoldes.com.br {
     handle_path /api/* {
       reverse_proxy api:3333
     }
     handle {
       reverse_proxy web:80
     }
   }
   ```

3. Só o Caddy publica portas (80 e 443). Banco, API e armazenamento ficam
   acessíveis apenas na rede interna do Docker.
4. Segredos em um `.env` fora do git, lido pelo compose.
5. `healthcheck` em cada serviço e `depends_on` com `condition: service_healthy`
   para a API só subir com o banco pronto.

**Dicas e cuidados.**

- `handle_path` remove o `/api` antes de repassar. As rotas da API não mudam.
- As fotos são servidas pela API em `/uploads/...`. Com o prefixo, os endereços
  viram `/api/uploads/...`; o frontend já monta isso a partir do `API_URL`.
- Hoje o Postgres publica a porta 5433 para a máquina. Em produção, **não**
  publicar.
- Trocar as senhas de exemplo (`senha_segura`, `user_admin`) por valores
  gerados.

**Como testar.** `docker compose -f docker-compose.prod.yml up -d`, reiniciar a
máquina e conferir que tudo volta sozinho; `docker compose ps` com todos
"healthy".

**Melhorias futuras.** Deploy automático: um workflow do GitHub Actions que, a
cada push no `main`, constrói as imagens, publica no registro do GitHub e manda
o servidor atualizar.

### 2.4 Onde ficam as fotos em produção — decisão + tamanho P

**Situação atual.** O `StorageService` já suporta dois modos: pasta local
`./uploads` ou qualquer serviço compatível com S3 (variáveis `S3_*`). No Pi há
um Garage local com o bucket `muni-moldes`.

**Opções.**

| Opção | Quando faz sentido |
|---|---|
| Garage no mesmo servidor | VPS único; simples; o backup das fotos é por sua conta |
| Serviço gerenciado (Cloudflare R2, Backblaze B2) | Quer durabilidade sem cuidar de disco; custo baixo para este volume |
| Pasta local com volume Docker | O mais simples de todos; serve para começar |

**Recomendação:** começar com volume local ou Garage e migrar para um serviço
gerenciado se o catálogo crescer. A troca é só de variáveis de ambiente mais uma
cópia dos arquivos, porque o banco guarda apenas `/uploads/<nome>`.

**Passo a passo.** Definir as variáveis `S3_*` no `.env` de produção; criar o
bucket e a chave de acesso; enviar uma foto pelo painel e conferir.

### 2.5 Migrações de banco — tamanho M

**Situação atual.** `DB_SYNCHRONIZE=true`: a cada inicialização o TypeORM
compara as classes com o banco e altera as tabelas sozinho. Em uma mudança de
tipo ou renomeação de coluna, ele **apaga e recria a coluna, perdendo os dados**.

**Objetivo.** Toda mudança de banco virar um arquivo versionado, revisável e
aplicado de forma controlada.

**Passo a passo.**

1. Criar `backend-moldes/src/database/data-source.ts`, exportando um
   `DataSource` com a mesma configuração do `app.module.ts`, lendo o `.env`.
   Extrair a configuração para uma função única, usada pelos dois lugares.
2. Scripts no `package.json`: `migration:generate`, `migration:run`,
   `migration:revert`.
3. Gerar a **migração inicial** a partir de um banco vazio, descrevendo todas as
   tabelas atuais: `users`, `products`, `product_images`, `collections`,
   `news_posts`, `site_settings`, `audit_logs`.
4. No banco que já existe (o do Pi), marcar a migração inicial como aplicada
   sem executá-la, inserindo a linha correspondente na tabela `migrations`.
5. Trocar o padrão de `DB_SYNCHRONIZE` para `false` e ligar `migrationsRun: true`
   (aplica as pendentes ao subir) ou rodar `migration:run` como etapa do deploy.
6. Documentar no README o fluxo: mudou uma entidade, gera a migração, revisa o
   SQL, commita junto.

**Dicas e cuidados.**

- O projeto usa TypeORM 1.x, lançado recentemente. Conferir a documentação da
  versão antes de escrever os scripts, porque a linha de comando mudou em
  relação à série 0.3 e eu não testei esses comandos nesta versão.
- O backend é compilado como módulo ES. O CLI precisa apontar para os arquivos
  já compilados em `dist/`, não para os `.ts`.
- **Sempre ler o SQL gerado.** O gerador não entende renomeação: ele propõe
  apagar e criar. Renomeações se escrevem à mão.
- Fazer backup (item 2.6) antes de aplicar qualquer migração em produção.
- Há uma conversão pendente anotada no PR #2: colunas de data que passaram a
  `timestamptz`. Ela deve entrar como migração escrita à mão, com
  `USING coluna AT TIME ZONE 'UTC'`.

**Como testar.**

- Banco vazio + `migration:run` resulta no mesmo esquema que o `synchronize`
  produz hoje (comparar com `pg_dump --schema-only`).
- `migration:revert` desfaz a última sem erro.
- A API sobe com `DB_SYNCHRONIZE=false` e os 210 testes continuam passando.

**Melhorias futuras.** Um teste no CI que sobe um Postgres, aplica todas as
migrações e falha se as entidades tiverem mudança sem migração correspondente.

### 2.6 Backup — tamanho M

**Situação atual.** Nenhum. Uma falha de disco perde catálogo, notícias,
usuários e fotos.

**Objetivo.** Cópia diária automática, guardada fora do servidor, com
restauração testada.

**Passo a passo.**

1. Script `scripts/backup.sh`:
   - `pg_dump` do banco, compactado, com a data no nome;
   - cópia das fotos (sincronização do bucket ou da pasta `uploads`);
   - envio para um destino externo (um bucket em outro provedor, por exemplo);
   - retenção: 7 diários, 4 semanais, 6 mensais.
2. Agendar com `cron` ou um temporizador do systemd, de madrugada.
3. Script `scripts/restore.sh`, com as instruções no README.
4. Um aviso quando o backup falhar (item 2.9).

**Dicas e cuidados.**

- Backup no mesmo disco não é backup. O destino precisa ser outro lugar.
- Um backup nunca restaurado é só uma esperança. Fazer um teste de restauração
  completo logo depois de configurar, e repetir de tempos em tempos.
- O arquivo contém os hashes das senhas. Criptografar antes de enviar
  (ferramentas como `restic` ou `age` fazem isso).
- A ferramenta `restic` resolve cópia, criptografia e retenção de uma vez, e é
  uma alternativa a escrever o script à mão.

**Como testar.** Restaurar o backup em uma máquina limpa e conferir que o
catálogo abre com fotos e que o login funciona.

### 2.7 Ambiente de desenvolvimento estável — tamanho P

**Situação atual.** No Pi, site e API são iniciados à mão e caem quando a sessão
do terminal termina. Foi a causa do "não consigo abrir o site".

**Objetivo.** Os dois sempre no ar no Pi, voltando sozinhos após reinício.

**Opções.**

- **Serviços do systemd em modo usuário** (`systemctl --user`), um para a API
  (com `nest start --watch`) e um para o Vite. Não precisa de `sudo`; precisa
  de `loginctl enable-linger joaolotjr` uma vez (esse sim com `sudo`) para
  rodarem sem ninguém logado.
- **Acrescentar os dois ao `docker-compose.yml`** de desenvolvimento, montando
  o código como volume. Mais uniforme com produção, mas a recarga automática
  fica um pouco mais lenta.

**Recomendação:** systemd em modo usuário, por ser leve e manter a recarga
rápida.

**Como testar.** Reiniciar o Pi e abrir o site pelo endereço do Pi na rede, sem ter
iniciado nada.

### 2.8 Integração contínua (GitHub Actions) — tamanho P

**Situação atual.** Não existe. As verificações são rodadas à mão. Já estava
anotado como afazer futuro.

**Objetivo.** Todo PR mostra se lint, build e testes passam, e o `main` só
aceita o que passou.

**Passo a passo.**

1. `.github/workflows/ci.yml` com dois jobs em Node 26:
   - `frontend`: `npm ci`, `npm run lint`, `npm run build`;
   - `backend`: `npm ci`, `npm run build`, `npm test`.
2. Depois da primeira execução, em Settings > Branches, proteger o `main`
   exigindo os dois checks.
3. Acrescentar `npm audit --omit=dev --audit-level=high` como etapa.

**Dicas e cuidados.**

- O lint do backend tem cerca de 40 avisos antigos em arquivos que não foram
  tocados (formatação e uso de tipos soltos). Antes de exigir o lint do backend
  no CI, é preciso zerá-los, senão todo PR fica vermelho. Sugestão: uma branch
  só de `eslint --fix` mais correções manuais, sem misturar com funcionalidade.
- Os testes de imagem são pesados. Se ficarem lentos no CI, o tempo limite já
  está em 30 segundos no arquivo de teste.

**Como testar.** Abrir um PR com um erro de tipo proposital e ver o check
falhar; corrigir e ver passar.

**Melhorias futuras.** Testes de ponta a ponta no CI (item 5.3) e o deploy
automático (item 2.3).

### 2.9 Monitoramento e registros — tamanho P

**Situação atual.** Os registros da API vão para um arquivo temporário e não há
aviso se o site cair.

**Passo a passo.**

1. **Disponibilidade:** cadastrar o endereço `/health` em um serviço de
   monitoramento externo (UptimeRobot e Better Stack têm plano gratuito), com
   aviso por e-mail ou Telegram.
2. **Registros:** com Docker, os registros ficam em `docker compose logs`.
   Limitar o tamanho com as opções `max-size` e `max-file` do driver de log.
3. **Erros da aplicação:** opcional, um serviço como o Sentry para receber os
   erros do site e da API com contexto.
4. **Backup:** fazer o script do item 2.6 chamar um endereço de "sinal de vida"
   (healthchecks.io) ao terminar; se o sinal não chegar, você é avisado.

### 2.10 Lista de conferência antes de publicar

- [ ] Senhas de banco, `JWT_SECRET` e chaves do armazenamento geradas, não as de exemplo
- [ ] `NODE_ENV=production`, `CORS_ORIGINS`, `TRUST_PROXY` definidos
- [ ] `DB_SYNCHRONIZE=false` e migrações aplicadas
- [ ] `ADMIN_EMAIL` real e senha forte; senha trocada no primeiro acesso
- [ ] Dados de exemplo apagados (produtos fictícios, notícias de exemplo)
- [ ] Dados de contato reais preenchidos em Painel > Configurações
- [ ] Textos comerciais revisados pelos primos
- [ ] Backup configurado e restauração testada
- [ ] Monitoramento ativo
- [ ] Teste completo pelo celular: catálogo, orçamento pelo WhatsApp, painel

---

## 3. Funcionalidades para vender mais

Ordem pensada para cada item aproveitar o anterior: primeiro o código do
produto, que a lista de orçamento usa.

### 3.1 Código do produto (referência) — tamanho P

**Situação atual.** O produto só tem nome e endereço. A mensagem de orçamento
cita o nome e o link.

**Objetivo.** Cada molde ter um código curto (por exemplo `MM-0142`), visível no
catálogo e usado nos pedidos.

**Passo a passo.**

1. `products/entities/product.entity.ts`: coluna `code`, texto de até 30
   caracteres, única, opcional.
2. `products/dto/save-product.dto.ts`: campo `code` com `@TrimToNull`, tamanho
   máximo e um padrão simples (letras maiúsculas, números, hífen e ponto).
3. `common/save-rules.ts`: a mensagem de valor repetido hoje fala só de
   "endereço". Distinguir qual campo repetiu, lendo o nome da restrição que o
   Postgres informa no erro.
4. Painel, `ProductForm.tsx`: campo "Código" ao lado do nome.
   `ProductsList.tsx`: coluna do código e busca por ele.
5. Site: código no cartão (`ProductCard.tsx`), na ficha (`ProductDetails.tsx`)
   e na mensagem de orçamento (`productQuoteLink` em `config/site.ts`).
6. A busca do catálogo (`Catalog.tsx`) passa a procurar também pelo código.
7. Migração criando a coluna.

**Dicas e cuidados.**

- Deixar opcional no início: os produtos atuais não têm código.
- Perguntar aos primos se já usam alguma numeração. Se usam, adotar a deles.
- Não gerar o código automaticamente a partir do id: um código só tem valor se
  for o mesmo que está na etiqueta, na nota e na conversa.

**Como testar.** Cadastrar com código, tentar repetir (deve recusar com
mensagem clara), buscar pelo código no catálogo e no painel, conferir a
mensagem do WhatsApp. Testes do DTO e do serviço.

**Melhorias futuras.** Código de barras ou QR na ficha do molde, levando à
página do produto.

### 3.2 Mais dados técnicos — tamanho P

**Situação atual.** Há dois campos de texto livre: `dimensions` e
`final_weight`.

**Objetivo.** O comprador profissional conseguir comparar moldes pelo que
importa na produção.

**Passo a passo.**

1. Novas colunas opcionais em `Product`:
   - `cavities` (inteiro): número de cavidades;
   - `material` (texto curto): por exemplo "Silicone platinado";
   - `piece_weight` (texto curto): peso da peça pronta, por cavidade;
   - `min_order` (inteiro): pedido mínimo, se houver.
2. DTO, formulário do painel e tabela de especificações da ficha, mostrando só
   os campos preenchidos (como já acontece hoje).
3. No catálogo, filtro por número de cavidades, se fizer sentido para o volume
   de produtos.

**Dicas e cuidados.**

- **Confirmar a lista de campos com os primos antes de criar.** Cada campo que
  ninguém preenche vira ruído no formulário.
- O campo `final_weight` hoje aparece na ficha como "Peso", sem dizer se é do
  molde ou da peça. Decidir o significado e ajustar o rótulo.
- Manter texto livre onde a unidade varia ("250 g", "20 g por cavidade").

**Como testar.** Cadastrar um produto com todos os campos e outro com nenhum;
a ficha não pode mostrar linhas vazias.

**Melhorias futuras.** Atributos configuráveis pelo painel, sem precisar de
programador para criar um campo novo. É bem mais complexo e só compensa se os
tipos de molde forem muito diferentes entre si.

### 3.3 Ordenação e destaques — tamanho M

**Situação atual.** A API devolve os produtos na ordem de cadastro e a home
mostra os últimos adicionados invertendo essa lista. Não há como destacar um
produto.

**Objetivo.** Os primos decidirem o que aparece primeiro e o que ganha selo.

**Passo a passo.**

1. Novas colunas em `Product`: `is_featured` (verdadeiro/falso), `badge`
   (texto: vazio, "Lançamento", "Mais vendido") e `sort_order` (inteiro).
   Em `Collection`: `sort_order`.
2. `products.service.ts`, `findAll`: ordenar por `sort_order`, depois por
   `created_at` decrescente. A coluna `created_at` já existe.
3. Catálogo: seletor "Ordenar por" com as opções mais recentes, nome e
   destaques primeiro.
4. Home: uma seção "Destaques" com os marcados, mantendo "Últimos adicionados".
5. Painel: caixa "Destaque" e seletor de selo no formulário do produto; na
   lista de categorias, setas para subir e descer a ordem.
6. Selo visível no cartão do produto.

**Dicas e cuidados.**

- Arrastar e soltar para reordenar é agradável, mas dá trabalho e funciona mal
  no celular. Começar com setas e um campo numérico.
- "Mais vendido" marcado à mão é honesto só se for verdade. Como o site não
  registra vendas, deixar claro para os primos que o selo é uma escolha deles.

**Como testar.** Reordenar categorias e conferir a ordem no site; marcar um
destaque e vê-lo na home; conferir a ordenação pelo seletor.

**Melhorias futuras.** Ordenação por interesse real, usando os pedidos de
orçamento registrados (item 3.5).

### 3.4 Lista de orçamento — tamanho G

É o item de maior impacto do plano.

**Situação atual.** Cada produto tem um botão que abre o WhatsApp com uma
mensagem sobre aquele molde. Para pedir dez moldes, o cliente clica dez vezes
ou digita a lista à mão.

**Objetivo.** O cliente montar uma lista com vários moldes e quantidades, como
um carrinho sem pagamento, e enviar tudo em uma mensagem só.

**Passo a passo.**

1. **Estado.** `frontend-moldes/src/contexts/QuoteContext.tsx`: lista de itens
   `{ productId, slug, name, code, quantity }`, guardada no `localStorage` para
   sobreviver a recarregamentos. Funções: adicionar, alterar quantidade,
   remover, limpar.
2. **Botões.** Em `ProductCard.tsx` e `ProductDetails.tsx`, "Adicionar à lista"
   como ação principal. Na ficha, campo de quantidade antes de adicionar. O
   botão de WhatsApp direto continua como ação secundária.
3. **Indicador.** No cabeçalho (`PublicLayout.tsx`), um ícone de lista com a
   contagem de itens, levando à página da lista.
4. **Página `/orcamento`.** Tabela com foto pequena, código, nome, quantidade
   editável e remover. Abaixo, campos opcionais de nome, empresa, cidade e
   observações (reaproveitar o que já existe em `Contact.tsx`).
5. **Envio.** Botão "Enviar pelo WhatsApp" monta a mensagem, por exemplo:

   ```
   Olá! Gostaria de um orçamento:

   1. MM-0142 Ovo liso 250 g — 50 un.
   2. MM-0087 Coelho com ovo — 30 un.

   Empresa: Doces da Ana
   Cidade: Belo Horizonte/MG
   ```

6. **Depois do envio.** Perguntar se quer limpar a lista, em vez de limpar
   sozinho: o WhatsApp abre em outra aba e a pessoa pode voltar para ajustar.
7. **Validação dos itens.** Ao abrir a página, conferir na API se os produtos
   da lista ainda existem e estão ativos; avisar e remover os que saíram.

**Dicas e cuidados.**

- **Tamanho da mensagem.** O link do WhatsApp leva o texto na própria URL, e
  URLs muito longas são cortadas por alguns aparelhos. Com muitos itens,
  encurtar cada linha (só código e quantidade) e avisar o cliente. Vale testar
  o limite real com 30, 60 e 100 itens em Android e iPhone antes de definir a
  regra.
- **Sem cadastro.** Não exigir conta para montar a lista. Cada passo a mais
  perde pedido.
- **Quantidade mínima.** Se o item 3.2 criar o campo `min_order`, a página
  avisa quando a quantidade está abaixo, sem bloquear.
- O formulário de contato atual pode ganhar um atalho "Montar lista de
  orçamento", para não haver dois caminhos concorrentes.

**Como testar.**

- Adicionar itens, recarregar a página e ver a lista preservada.
- Alterar quantidade, remover, limpar.
- Conferir a mensagem gerada em Android e iPhone, com 1, 10 e 50 itens.
- Produto desativado no painel some da lista com aviso.
- Testes de unidade do montador de mensagem e do contexto (item 5.3).

**Melhorias futuras.**

- Link compartilhável da lista, para o cliente mandar a um sócio.
- Repetir um pedido anterior.
- Tabela de preços por faixa de quantidade, se os primos decidirem mostrar
  preço. Hoje o site não mostra preço nenhum, por decisão de negócio.

### 3.5 Registro dos pedidos de orçamento — tamanho M

**Situação atual.** O clique abre o WhatsApp e nada fica registrado. Não há
como saber quantos pedidos o site gera nem quais moldes despertam interesse.

**Objetivo.** Cada lista enviada ficar salva no painel.

**Passo a passo.**

1. Backend: módulo `quotes` com as tabelas `quote_requests` (data, nome,
   empresa, cidade, observações, situação) e `quote_items` (produto, código e
   nome copiados na hora, quantidade).
2. `POST /quotes`, sem login, com limite de requisições próprio e validação
   por DTO. O site chama esse endereço logo antes de abrir o WhatsApp.
3. Painel: tela "Orçamentos" com a lista, o detalhe e uma situação editável
   (novo, respondido, fechado, perdido). Nova permissão `quotes`.
4. Painel inicial: contagem de pedidos da semana e os moldes mais pedidos.
5. Texto de privacidade junto ao formulário (item 5.5).

**Dicas e cuidados.**

- O registro acontece **antes** de abrir o WhatsApp e não pode impedir o envio:
  se a chamada falhar, o WhatsApp abre do mesmo jeito.
- Registrar o pedido não garante que a mensagem foi enviada: a pessoa pode
  fechar o WhatsApp sem mandar. Tratar o número como "listas iniciadas".
- É um endereço aberto que grava no banco, então é alvo de robôs. Limite por
  IP, tamanho máximo de cada campo e um campo-isca invisível (quem o preenche é
  robô) resolvem a maior parte.
- A partir daqui o site guarda dados pessoais. O item 5.5 passa a ser
  obrigatório.

**Como testar.** Enviar uma lista e vê-la no painel; simular a API fora do ar e
confirmar que o WhatsApp abre; estourar o limite e receber 429.

**Melhorias futuras.** Aviso por e-mail ou Telegram a cada pedido novo;
exportação em planilha; integração com a API oficial do WhatsApp Business para
enviar a mensagem pelo servidor.

### 3.6 Catálogo em PDF — tamanho M

**Situação atual.** Não existe.

**Objetivo.** Um arquivo para o revendedor baixar, imprimir ou repassar.

**Opções.**

| Abordagem | Como funciona | Observação |
|---|---|---|
| **Página de impressão** | Uma rota `/catalogo/imprimir` com folha de estilo de impressão; o cliente usa "Salvar como PDF" do navegador | A mais simples; sem biblioteca nova; qualidade depende do navegador |
| Gerar no servidor | A API monta o PDF com uma biblioteca e guarda em cache | Arquivo sempre igual; mais código para manter |
| Navegador sem interface no servidor | Renderiza a página de impressão e salva o PDF | Melhor fidelidade; pesado para um servidor pequeno |

**Recomendação:** começar pela página de impressão. Se o resultado agradar, o
botão "Baixar catálogo" pode evoluir para um arquivo gerado no servidor uma vez
por dia.

**Passo a passo (página de impressão).**

1. Rota nova com capa (logo e contatos), uma seção por categoria e os produtos
   em grade, cada um com foto, código, nome e especificações.
2. Estilos `@media print`: sem menu e rodapé, quebras de página entre
   categorias, margens em centímetros.
3. Botão "Baixar catálogo (PDF)" no catálogo, que abre a rota e chama a
   impressão.
4. Opção de gerar só uma categoria.

**Dicas e cuidados.** Fotos em 2000 px deixariam o arquivo enorme; usar as
miniaturas do item 5.4. Testar a impressão em Chrome e Safari, que tratam
quebras de página de modo diferente.

**Como testar.** Gerar o PDF completo e de uma categoria; conferir tamanho do
arquivo, quebras de página e legibilidade impresso em preto e branco.

### 3.7 Foto de capa nas categorias — etapa 1: P; etapa 2: M

**Situação atual.** Na home, a seção de linhas de produto mostra cada categoria
como um cartão de cor lisa (rosa, verde e cinza, alternados), com a contagem de
moldes e o nome. A categoria não tem imagem: a tabela `collections` guarda só
nome, endereço e visibilidade.

**Objetivo.** Cada cartão de categoria mostrar uma foto ao fundo, para a home
ficar mais visual e o cliente reconhecer a linha de relance.

**Decisão do João (17/11/2026).** A capa principal é uma foto de ambiente
enviada pelo painel. Quando a categoria não tiver capa própria, entra a capa
automática. A ordem de escolha fica:

1. foto própria da categoria (`cover_url`);
2. capa automática: foto do primeiro produto da categoria;
3. cor lisa de hoje, se a categoria não tiver nenhum produto com foto.

**Duas etapas.** As duas serão feitas. A capa automática vem primeiro porque não
depende de banco nem de painel e já deixa todos os cartões com imagem enquanto
as fotos de ambiente não ficam prontas.

#### Etapa 1: capa automática — tamanho P, só no site

A home já carrega a lista de produtos (com fotos e categoria) e a lista de
categorias. Basta cruzar as duas.

1. `Home.tsx`: montar um mapa "categoria → foto", percorrendo os produtos e
   guardando, para cada categoria, a primeira foto encontrada. Fica ao lado do
   `countByCollection`, que já faz um percurso igual para contar os moldes.
2. Regra de escolha da foto, nesta ordem: a foto marcada como capa
   (`is_cover`) do primeiro produto da categoria; se não houver, a primeira
   foto desse produto; se o produto não tiver foto, passa para o próximo.
3. No cartão, quando houver foto: a imagem vira o fundo (um `<img>` absoluto
   com `object-cover` e `loading="lazy"`), com uma camada em degradê por cima e
   o texto em branco. Quando não houver, o cartão fica exatamente como hoje,
   com a cor lisa de `collectionTones`.
4. Leve aproximação da foto ao passar o mouse, respeitando
   `prefers-reduced-motion`.
5. Usar a mesma regra no topo do catálogo quando uma categoria está filtrada
   (`Catalog.tsx`), extraindo a função para um utilitário compartilhado.

Nada muda no backend, no banco nem no painel. Não precisa de migração.

**Limites da etapa 1.**

- Quem decide a foto é a ordem dos produtos. Para trocar a capa de uma
  categoria, é preciso mudar qual produto vem primeiro, o que hoje só se faz
  pela ordem de cadastro. O item 3.3 (ordenação) dá esse controle.
- A foto é sempre de um molde isolado, que não é o tipo de imagem que mais
  valoriza o cartão (ver "Dicas e cuidados").
- Depende de a home já ter carregado os produtos. Hoje carrega todos; se o
  catálogo crescer muito e a listagem passar a ser paginada, a escolha da capa
  deve ir para a API, que devolveria a foto junto com cada categoria.

#### Etapa 2: foto própria por categoria — tamanho M

É a capa principal: uma foto de ambiente escolhida para a categoria. A capa
automática continua valendo para as categorias sem foto própria.

**Orientação para as fotos de ambiente** (vale para pedir ao Gemini ou para
fotografar):

- formato horizontal, na proporção 2:1 (por exemplo 1600 × 800), que é a do
  cartão;
- o assunto no centro ou na metade de cima: o nome da categoria fica no canto
  inferior esquerdo e a contagem no superior esquerdo;
- mostrar o resultado, não o molde: chocolates e doces prontos daquela linha,
  em uma cena simples;
- luz suave e paleta próxima à do site (tons quentes, rosados e creme), para os
  seis cartões conversarem entre si;
- sem texto, logotipo ou marca d'água na imagem;
- mesmo estilo em todas, para a grade não parecer uma colagem.

Categorias que precisam de foto hoje: Páscoa, Bombons, Barras e tabletes,
Natal, Pirulitos, Ornamentos e molduras, Bebê e infantil, Flores. A home mostra
as seis primeiras.

1. `collections/entities/collection.entity.ts`: coluna `cover_url`, opcional.
2. Rotas novas, no mesmo molde da capa das notícias (`news.controller.ts`):
   `POST /collections/:id/cover` e `DELETE /collections/:id/cover`, com a
   permissão `collections`, usando `StorageService.saveImage` (a foto já sai
   compactada e sem metadados) e `removeByUrl` ao trocar ou excluir.
3. Apagar a capa do armazenamento quando a categoria for excluída.
4. Painel, `CollectionForm.tsx`: bloco "Foto de capa" com escolher,
   pré-visualizar e remover, reaproveitando o que existe no formulário de
   notícias. Mostrar ali qual seria a capa automática, para a pessoa saber o
   que aparece se não enviar nada.
5. Site: a regra da etapa 1 ganha um passo na frente: se a categoria tem
   `cover_url`, usa essa; senão, segue a escolha automática.
6. Usar a capa também na prévia de compartilhamento da categoria (item 4.2).
7. O registro de atividades precisa reconhecer a nova rota: acrescentar
   `collections` ao tratamento de `/cover` em `audit.interceptor.ts` (hoje a
   frase gerada fala em "notícia").
8. Migração criando a coluna.

**Dicas e cuidados.**

- **Legibilidade vem primeiro.** Texto sobre foto só funciona com a camada
  escura. As fotos dos moldes são cinza-claro sobre fundo branco: sem o
  degradê, o nome branco some. Testar com a foto mais clara do catálogo.
- **Fotos de molde isolado não são as melhores capas.** Um molde cinza em fundo
  branco, ampliado e escurecido, fica sem graça. O que valoriza o cartão é uma
  foto de ambiente: os chocolates prontos daquela linha, uma mesa de Páscoa,
  uma caixa de bombons. Vale pedir fotos pensadas para isso.
- **Proporção.** O cartão é largo e baixo (cerca de 2:1). O navegador corta a
  foto para caber; orientar no painel a usar fotos horizontais e mostrar a
  pré-visualização já no formato do cartão.
- **Peso da página.** São até seis fotos a mais na home. Usar a versão média
  das miniaturas (item 5.4) e `loading="lazy"`.
- **Manter as cores como identidade.** Uma opção é tingir a camada com a cor
  que o cartão tem hoje (rosa, verde, cinza), em vez de preto puro. Preserva o
  visual do Stitch.
- O cartão da categoria com poucos itens ("1 molde") continua igual; a foto não
  muda a contagem.

**Como testar.**

- Categoria com capa própria, categoria só com capa automática e categoria sem
  nenhuma foto: os três casos precisam ficar apresentáveis lado a lado.
- Contraste do nome e da contagem sobre a foto mais clara, conferido com uma
  ferramenta de contraste (mínimo de 4,5:1).
- Trocar e remover a capa pelo painel e conferir que o arquivo antigo some do
  armazenamento.
- Home no celular: os cartões empilham e o texto continua legível.
- Testes do serviço e do controller, como os da capa de notícias.

**Melhorias futuras.** Ponto de foco ajustável (escolher qual parte da foto
fica visível no corte); página própria por categoria, com a capa em destaque e
um texto de apresentação da linha, o que também ajuda na busca do Google.

### 3.8 Produto em mais de uma categoria — tamanho M

**Situação atual.** Não está implementado. Cada produto aponta para uma única
categoria (coluna `collection_id` em `products`, relação muitos-para-um). Um
pirulito com o rosto do Papai Noel só pode estar em "Pirulitos" **ou** em
"Natal", nunca nas duas.

**Objetivo.** Um produto poder aparecer em várias categorias, com uma delas
marcada como principal.

**Por que manter uma categoria principal.** Vários lugares precisam de uma
resposta única: o selo no cartão do produto, o caminho de navegação da ficha
("Catálogo / Natal / Rosto de Papai Noel") e o endereço canônico para o Google.
Sem uma principal, cada um desses pontos teria que escolher ao acaso.

**Passo a passo.**

1. **Banco.** Tabela de ligação `product_collections` (`product_id`,
   `collection_id`), com chave primária composta e exclusão em cascata dos dois
   lados. A coluna `collection_id` de `products` continua existindo e passa a
   significar "categoria principal".
2. **Entidades.** Em `Product`, relação muitos-para-muitos `collections`, além
   da `collection` atual. Em `Collection`, o lado inverso.
3. **Migração.** Criar a tabela e copiar o vínculo atual de cada produto para
   ela, para ninguém perder a categoria que já tem.
4. **Validação** (`save-product.dto.ts`). Novo campo `collection_ids`: lista de
   identificadores, sem repetição, com um limite razoável (por exemplo 5). A
   principal (`collection_id`) precisa estar na lista; se a lista vier sem a
   principal, o serviço a inclui.
5. **Serviço** (`products.service.ts`):
   - criar e alterar gravam a lista de categorias;
   - o filtro por categoria (`findAll` com `collection`) passa a procurar na
     tabela de ligação, não só na principal;
   - as respostas trazem `collection` (principal) e `collections` (todas).
6. **Exclusão de categoria** (`collections.service.ts`). Hoje só se exclui
   categoria vazia. Nova regra: bloquear apenas se algum produto a tem como
   **principal**; se ela for só secundária, o vínculo é removido junto.
7. **Painel, formulário do produto.** Trocar o seletor único por uma lista de
   caixas de seleção, com um botão "principal" em uma delas. A primeira marcada
   vira principal automaticamente.
8. **Painel, listas.** Na lista de produtos, mostrar a principal e um
   "+2" para as demais; o filtro por categoria considera todas. Na lista de
   categorias, a contagem passa a incluir os produtos secundários.
9. **Site.**
   - `Catalog.tsx` e `Home.tsx`: a contagem por categoria e o filtro consideram
     todas as categorias do produto. Hoje o filtro é feito no navegador,
     comparando com a categoria única; passa a conferir a lista.
   - `ProductCard.tsx`: o selo continua mostrando só a principal.
   - `ProductDetails.tsx`: o caminho de navegação usa a principal; na ficha,
     uma linha "Também em: Pirulitos" com links para as demais. Os "moldes
     relacionados" passam a considerar qualquer categoria em comum.
10. **Capa automática da categoria** (item 3.7): a regra passa a olhar os
    produtos de todas as categorias, com preferência para aqueles em que ela é
    a principal.
11. **Tipos do frontend** (`types.ts`): `collections` em `Product`.

**Dicas e cuidados.**

- **A soma das contagens deixa de bater com o total.** Um produto em duas
  categorias conta nas duas. "Todos os moldes: 20" continua correto, mas a
  soma das linhas dará mais que 20. É o comportamento esperado; vale não
  mostrar somatório em lugar nenhum.
- **Não duplicar o produto na listagem geral.** Na consulta com junção à tabela
  de ligação, um produto em duas categorias aparece em duas linhas. Usar
  `DISTINCT` ou buscar as categorias em uma segunda consulta.
- **Avaliar marcadores (tags) como alternativa.** Se a necessidade for cruzar
  "tipo de produto" (pirulito, bombom, barra) com "ocasião" (Natal, Páscoa),
  dois eixos separados podem servir melhor que categorias múltiplas: o cliente
  filtraria "Pirulitos" e, dentro, "Natal". É mais poderoso, mas é uma mudança
  maior no catálogo e no painel. Conversar com os primos sobre como os
  clientes procuram antes de escolher.
- Fazer este item **antes** da lista de orçamento (3.4) e da foto de capa
  (3.7, etapa 2) evita mexer duas vezes nas mesmas telas.

**Como testar.**

- Produto em "Natal" (principal) e "Pirulitos": aparece nos dois filtros do
  catálogo e uma única vez em "Todos os moldes".
- Contagem das duas categorias sobe em um; o total não muda.
- Ficha com o caminho pela principal e o link "Também em".
- Excluir uma categoria secundária remove só o vínculo; excluir a principal de
  algum produto é bloqueado com mensagem clara.
- Migração: todos os produtos existentes mantêm a categoria atual.
- Testes do serviço (filtro, gravação, exclusão) e do DTO (lista repetida,
  identificador inválido, limite).

**Melhorias futuras.** Filtros combinados no catálogo (tipo + ocasião);
categorias com subcategorias.

---

## 4. Ser encontrado no Google e compartilhado no WhatsApp

Esta seção só rende com o site publicado em um domínio.

### 4.1 Título e descrição por página — tamanho P

**Situação atual.** O `index.html` tem um título e uma descrição fixos. Toda
página aparece igual na aba do navegador e nos resultados de busca.

**Objetivo.** Cada página com título e descrição próprios.

**Passo a passo.**

1. O React 19, usado no projeto, permite escrever `<title>` e `<meta>` dentro
   de qualquer componente e os move para o cabeçalho da página. Não precisa de
   biblioteca.
2. Criar `components/public/Seo.tsx`, que recebe `title`, `description` e
   `image` e escreve `title`, `meta description`, `link canonical` e as tags
   `og:*`.
3. Usar em todas as páginas públicas:
   - Home: nome da empresa e frase principal;
   - Catálogo: "Catálogo de moldes" ou o nome da categoria filtrada;
   - Ficha: nome do molde, com a descrição cortada em cerca de 155 caracteres e
     a primeira foto;
   - Notícia: título, resumo e imagem de capa;
   - Sobre e Contato.
4. Nas páginas do painel e na de orçamento, `meta robots noindex`.

**Dicas e cuidados.** O endereço canônico precisa do domínio final. Guardar em
uma variável `VITE_SITE_URL`.

**Como testar.** Navegar e ver o título da aba mudar; inspecionar o cabeçalho
da página; depois de publicado, a ferramenta de inspeção de URL do Google
Search Console.

### 4.2 Prévia ao compartilhar no WhatsApp — tamanho M ou G

**Situação atual.** O site é montado inteiro no navegador. O robô do WhatsApp
(e os do Facebook, Telegram e LinkedIn) **não executa JavaScript**: ele lê só o
`index.html` cru. Por isso, um link de produto compartilhado não mostra foto
nem nome. O item 4.1 sozinho **não resolve isso**.

Para um negócio que vende pelo WhatsApp, é o item mais importante desta seção.

**Opções.**

| Abordagem | Como funciona | Esforço | Observação |
|---|---|---|---|
| **A. HTML para robôs** | O proxy identifica o robô pelo `User-Agent` e repassa o pedido a uma rota da API, que devolve um HTML mínimo com as tags `og:*` daquela página | M | Resolve a prévia sem mexer no frontend |
| B. Pré-renderização no build | Gera um HTML estático por página durante o build | M | Precisa refazer o build a cada produto novo; ruim para catálogo editável |
| C. Renderização no servidor | Migrar o frontend para um framework com SSR (Next.js, React Router em modo framework) | G | Solução definitiva, também melhor para o Google; é uma reescrita parcial |

**Recomendação:** abordagem A agora, e reavaliar a C só se o tráfego orgânico se
tornar prioridade.

**Passo a passo (abordagem A).**

1. API: módulo `share`, com `GET /share/molde/:slug` e
   `GET /share/noticias/:slug`, devolvendo HTML com `og:title`,
   `og:description`, `og:image`, `og:url`, `twitter:card` e um redirecionamento
   para a página real, caso um humano caia ali.
2. Caddy: regra que, para os caminhos `/molde/*` e `/noticias/*`, quando o
   `User-Agent` contém `WhatsApp`, `facebookexternalhit`, `Twitterbot`,
   `TelegramBot`, `LinkedInBot` ou `Slackbot`, repassa para a rota da API.
3. Imagem de prévia: o WhatsApp aceita WebP, mas o formato mais seguro para
   prévias ainda é JPEG. Gerar no upload uma versão `og` em JPEG de 1200 × 630
   (junto com as miniaturas do item 5.4).
4. Uma imagem padrão para a home e o catálogo, com logo e nome.

**Dicas e cuidados.**

- Escapar todo texto que entra no HTML (nome e descrição vêm do painel). Sem
  isso, um nome com `<script>` viraria uma brecha.
- O WhatsApp guarda a prévia em cache por bastante tempo. Para refazer o teste,
  acrescentar um parâmetro qualquer ao link (`?v=2`).
- Servir conteúdo diferente para robôs só é aceitável quando o conteúdo
  equivale ao que o humano vê. Aqui são os mesmos título, descrição e foto.

**Como testar.**

- `curl -A "WhatsApp/2.0" https://.../molde/ovo-liso` devolve o HTML com as
  tags; sem o `-A`, devolve o site normal.
- Depurador de compartilhamento da Meta (developers.facebook.com/tools/debug).
- Enviar o link para si mesmo no WhatsApp e ver foto, nome e descrição.

### 4.3 Sitemap e robots.txt — tamanho P

**Situação atual.** Não existem.

**Passo a passo.**

1. `GET /sitemap.xml` na API, gerado na hora a partir de produtos, categorias e
   notícias visíveis, com cache de uma hora. Incluir a data da última
   alteração.
2. Para a data ser real, acrescentar `updated_at` às tabelas `products` e
   `collections` (`news_posts` precisa ser conferida).
3. Caddy: repassar `/sitemap.xml` para a API.
4. `frontend-moldes/public/robots.txt`: liberar tudo, bloquear `/admin` e
   `/orcamento`, e apontar para o sitemap.

**Como testar.** Abrir `/sitemap.xml` e validar o formato; conferir que um
produto inativo não aparece; enviar o sitemap no Search Console.

### 4.4 Dados estruturados — tamanho P

**Objetivo.** O Google entender que as páginas são de produtos de uma empresa,
o que pode render resultados mais ricos.

**Passo a passo.**

1. Na ficha do molde, um bloco JSON-LD do tipo `Product`, com nome, descrição,
   imagens, código (`sku`) e marca.
2. Na home, `Organization` com nome, logo, contatos e redes sociais.
3. Na ficha e no catálogo, `BreadcrumbList` com o caminho de navegação.
4. Nas notícias, `Article`.

**Dicas e cuidados.** Sem preço, o Google não mostra o resultado de produto
completo. Ainda assim os dados ajudam na compreensão da página. Não inventar
avaliações nem preços para "ganhar estrelas": é contra as diretrizes e pode
gerar punição.

**Como testar.** Teste de resultados avançados do Google
(search.google.com/test/rich-results).

### 4.5 Google Search Console e Perfil da Empresa — tamanho P

1. Verificar o domínio no Search Console e enviar o sitemap.
2. Criar o Perfil da Empresa no Google (antigo Google Meu Negócio), com
   endereço, horário, fotos e link do site. Para um negócio local, costuma
   trazer mais contato que o próprio site.
3. Revisar o relatório de cobertura algumas semanas depois e corrigir páginas
   não indexadas.

### 4.6 Velocidade — tamanho P

A velocidade pesa na posição de busca e na desistência em celular.

1. Miniaturas (item 5.4): é o maior ganho, porque hoje a listagem carrega fotos
   de 2000 px.
2. `loading="lazy"` e dimensões (`width` e `height`) em todas as imagens, para
   a página não "pular" ao carregar.
3. Dividir o código por rota com `React.lazy`: quem visita o catálogo não
   precisa baixar o painel administrativo.
4. Compactação e cache longo dos arquivos estáticos no Caddy.
5. Hospedar as fontes no próprio site, em vez de buscar no Google Fonts.

**Como testar.** PageSpeed Insights antes e depois, no celular. Anotar os
números antes de começar, para medir o ganho de verdade.

---

## 5. Qualidade e acabamento

### 5.1 Página 404 — tamanho P

**Situação atual.** Em `App.tsx`, qualquer endereço desconhecido redireciona
para a home sem avisar. Um link quebrado parece funcionar, e o Google entende
como conteúdo duplicado.

**Passo a passo.**

1. `pages/public/NotFound.tsx`, com mensagem, busca e atalhos para o catálogo e
   o contato.
2. Trocar a rota `*` do redirecionamento por essa página, com `noindex`.
3. Usar a mesma página quando um produto ou notícia não existe (hoje cada
   página tem sua própria mensagem).
4. Na abordagem A do item 4.2, a rota para robôs responde 404 de verdade para
   itens inexistentes.

**Como testar.** Abrir `/qualquer-coisa` e `/molde/nao-existe`.

### 5.2 Aviso antes de sair por inatividade — tamanho P

**Situação atual.** Após 5 minutos parado, o painel desconecta sem aviso. Um
formulário pela metade é perdido.

**Passo a passo.**

1. `hooks/useIdleLogout.ts`: expor quanto tempo falta.
2. `components/admin/IdleWarning.tsx`: quando faltar 1 minuto, uma janela com
   contagem regressiva e o botão "Continuar conectado".
3. Qualquer atividade já renova a sessão; o botão existe para quem está lendo a
   tela sem mexer.
4. Salvar rascunho dos formulários longos (produto e notícia) no navegador e
   oferecer a recuperação ao voltar.

**Dicas e cuidados.** O rascunho pode conter texto ainda não publicado.
Apagá-lo ao salvar com sucesso e ao sair.

**Como testar.** Com `SESSION_IDLE_MINUTES=2`, esperar o aviso, clicar em
continuar e verificar que a sessão segue; esperar de novo sem clicar e
verificar a saída.

### 5.3 Testes do frontend — tamanho M

**Situação atual.** O backend tem 210 testes. O frontend não tem nenhum. As
verificações de tela foram feitas com scripts avulsos que não ficaram no
repositório.

**Passo a passo.**

1. **Testes de unidade** com Vitest e Testing Library:
   - utilitários: `slugify`, `dates`, `apiError`, `images` (regras de recusa);
   - `services/session.ts`;
   - `config/site.ts` (montagem dos links e mensagens de WhatsApp);
   - componentes com lógica: `RequirePermission`, o contexto da lista de
     orçamento (item 3.4).
2. **Testes de ponta a ponta** com Playwright, em uma pasta `e2e/`:
   - visitante: abrir a home, filtrar o catálogo, abrir uma ficha, conferir o
     link de orçamento;
   - administrador: entrar, criar produto com foto, ver no catálogo, excluir;
   - permissões: usuário limitado não acessa o que não deve;
   - sessão: saída por inatividade com o tempo reduzido.
3. Um banco de testes separado, populado por um script, para os testes não
   dependerem dos dados do Pi.
4. Acrescentar as duas suítes ao CI (item 2.8).

**Dicas e cuidados.**

- Começar pelos testes de ponta a ponta dos fluxos que dão dinheiro (catálogo
  e orçamento). Valem mais que cobertura alta de componentes simples.
- No Pi, o Playwright precisa apontar para o Brave
  (`executablePath: '/usr/bin/brave-browser'`). No CI, usa o navegador que ele
  mesmo instala. Deixar isso configurável por variável de ambiente.
- Os scripts que usei para conferir as telas servem de base, mas precisam ser
  reescritos como testes de verdade.

**Como testar.** `npm test` e `npm run e2e` passando no Pi e no CI.

### 5.4 Fotos em vários tamanhos — tamanho M

**Situação atual.** O upload gera um único arquivo WebP de até 2000 px. O
cartão do catálogo, que ocupa cerca de 300 px, carrega esse arquivo inteiro.

**Objetivo.** Catálogo mais leve no celular, sem perder o zoom na ficha.

**Passo a passo.**

1. `storage/image-processing.ts`: gerar três versões por foto: miniatura
   (400 px), média (1000 px) e grande (2000 px). E a versão `og` em JPEG do
   item 4.2.
2. Convenção de nomes a partir do mesmo identificador: `<uuid>.webp`,
   `<uuid>-md.webp`, `<uuid>-sm.webp`. O banco continua guardando só o
   endereço principal; os demais são derivados.
3. `StorageService.removeByUrl`: apagar todas as versões.
4. Frontend: um componente `ProductImage` que usa `srcset` e `sizes`, deixando
   o navegador escolher o tamanho.
5. Script único para gerar as versões das fotos já existentes.

**Dicas e cuidados.**

- Gerar as versões no upload, não na hora da visita. Redimensionar sob demanda
  parece elegante, mas pesa no servidor e abre espaço para abuso.
- O padrão de nomes aceito em `uploads.controller.ts` (`KEY_PATTERN`) já admite
  hífen; conferir que os novos nomes passam.
- Se uma versão faltar (foto antiga), o navegador precisa cair na principal
  sem quebrar.

**Como testar.** Enviar uma foto e conferir os arquivos gerados; medir o peso
total da página do catálogo antes e depois; excluir o produto e conferir que
nada sobra no armazenamento.

**Melhorias futuras.** Formato AVIF como opção adicional; recorte quadrado
automático para os cartões.

### 5.5 Privacidade (LGPD) — tamanho P, mas obrigatório com o item 3.5

**Situação atual.** O site público não guarda dados pessoais: o formulário de
contato só monta a mensagem do WhatsApp. O painel guarda nome, e-mail e IP de
quem administra.

**Passa a ser necessário quando** entrar o registro de orçamentos (3.5) ou
qualquer ferramenta de estatística.

**Passo a passo.**

1. Página `/privacidade`, com: quem é o responsável, quais dados são coletados
   e para quê, por quanto tempo ficam, com quem são compartilhados (o WhatsApp
   é um deles) e como pedir a exclusão.
2. Link no rodapé e junto ao formulário de orçamento.
3. Prazo de retenção dos pedidos de orçamento, com limpeza automática (mesma
   rotina do item 1.4).
4. No painel, opção de excluir um pedido a pedido do titular.
5. Se entrar estatística de visitas, preferir uma ferramenta sem cookies
   (Plausible, Umami), o que dispensa o aviso de cookies.

**Dicas e cuidados.** Eu posso escrever a estrutura da página, mas **o texto
final precisa da revisão de alguém da área jurídica**. Não tenho como garantir
a conformidade legal.

### 5.6 Acessibilidade — tamanho P

1. Conferir contraste de texto e botões nas cores do Stitch, principalmente
   texto claro sobre o rosa.
2. Navegar todo o site e o painel só com o teclado; foco sempre visível.
3. Texto alternativo em todas as fotos de produto (hoje é o nome do molde, o
   que é adequado).
4. Rodar o Lighthouse e a extensão axe e corrigir o que apontarem.
5. Respeitar `prefers-reduced-motion` nas animações.

### 5.7 Limpeza e documentação — tamanho P

1. Apagar os dados de exemplo antes de publicar: 20 produtos, 8 categorias (as
   que sobrarem vazias), as notícias de exemplo.
2. `README.md` na raiz: o que é o projeto, como rodar, variáveis de ambiente,
   como publicar, como restaurar um backup. O atual é o modelo padrão.
3. Decidir o destino do `CONTEXTO.md`, que hoje fica fora do git: transformar
   em documentação do repositório ou manter só local.
4. Remover o `package-lock.json` vazio da raiz.
5. Zerar os avisos antigos do lint do backend (ver item 2.8).

---

## 6. Outras dicas

**Produto e negócio**

- **Fotos reais são o que mais pesa.** Nenhum item deste plano melhora o site
  tanto quanto boas fotos dos moldes de verdade, com fundo neutro e a peça
  pronta ao lado. As fotos geradas por IA servem só para testar.
- **Mostrar a peça pronta.** Quem compra molde quer ver o chocolate que sai
  dele. Vale um segundo tipo de foto por produto ("resultado").
- **Depoimentos e clientes atendidos**, com autorização, na home. Em venda
  entre empresas, é o que mais gera confiança.
- **Perguntas frequentes**: pedido mínimo, prazo, envio, cuidados com o molde.
  Reduz as mesmas perguntas no WhatsApp e ajuda na busca.
- **Molde personalizado.** Se os primos fazem sob encomenda, merece uma página
  própria com o passo a passo e um formulário específico.

**Técnicas**

- **Um item por branch e por PR**, saindo sempre do `main` atualizado. A pilha
  de cinco branches que existe hoje é o que se quer evitar daqui para frente.
- **Migração junto com a mudança.** A partir do item 2.5, toda alteração de
  entidade vai com a sua migração no mesmo PR.
- **Dados de exemplo por script**, em vez de cadastro manual, para recriar o
  ambiente de desenvolvimento do zero.
- **Número de WhatsApp e demais contatos** continuam vindo de Painel >
  Configurações. Nenhum item deste plano deve fixá-los no código.

---

## 7. Decisões que dependem do João ou dos primos

| # | Decisão | Bloqueia |
|---|---|---|
| 1 | Um PR só ou cinco, para levar as branches ao `main` | Tudo |
| 2 | Restaurar o `docker-compose.yml` original | 2.3 |
| 3 | Onde hospedar e qual domínio | 1.1, 2.1 a 2.6, toda a seção 4 |
| 4 | Onde ficam as fotos em produção | 2.4, 2.6 |
| 5 | Os primos já usam códigos nos moldes? | 3.1 |
| 6 | Quais dados técnicos eles querem informar | 3.2 |
| 7 | Há pedido mínimo? Mostrar no site? | 3.2, 3.4 |
| 8 | Registrar os pedidos de orçamento (e assumir a página de privacidade) | 3.5, 5.5 |
| 9 | Manter a decisão de não mostrar preços | 3.4, 4.4 |
| 10 | Quem revisa o texto de privacidade | 5.5 |
| 12 | Categorias múltiplas com uma principal, ou dois eixos (tipo e ocasião) | 3.8 |
| 11 | Fotos de ambiente das oito categorias (decidido: foto própria, com capa automática de reserva) | 3.7, etapa 2 |

## 8. Resumo por tamanho

| Tamanho | Itens |
|---|---|
| P | 1.1, 1.2, 1.3, 1.4, 2.4, 2.7, 2.8, 2.9, 3.1, 3.2, 3.7 (etapa 1), 4.1, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.5, 5.6, 5.7 |
| M | 2.2, 2.3, 2.5, 2.6, 3.3, 3.5, 3.6, 3.7 (etapa 2), 3.8, 4.2 (abordagem A), 5.3, 5.4 |
| G | 3.4, 4.2 (abordagem C) |
