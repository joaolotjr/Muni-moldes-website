# Garage (armazenamento das fotos)

O [Garage](https://garagehq.deuxfleurs.fr/) é um servidor compatível com S3. Aqui ele roda em um
nó só, para desenvolvimento. O backend fala com ele pela API S3, então em produção dá para trocar
por qualquer provedor S3 (Cloudflare R2, Backblaze B2...) mudando só o `.env` do backend.

## Primeira vez em uma máquina nova

```bash
# 1. Segredos do contêiner (na raiz do projeto)
cp .env.example .env
#    preencha GARAGE_RPC_SECRET e GARAGE_ADMIN_TOKEN, cada um com: openssl rand -hex 32

# 2. Subir
docker compose up -d garage
alias garage="docker exec muni_moldes_garage /garage"

# 3. Dar um papel ao nó (use o ID mostrado em "garage status")
garage status
garage layout assign -z dc1 -c 5G <ID_DO_NO>
garage layout apply --version 1

# 4. Bucket e chave de acesso do backend
garage bucket create muni-moldes
garage key create muni-moldes-backend      # anote "Key ID" e "Secret key"
garage bucket allow --read --write muni-moldes --key muni-moldes-backend
```

Coloque o "Key ID" e o "Secret key" em `backend-moldes/.env` (`S3_ACCESS_KEY_ID` e
`S3_SECRET_ACCESS_KEY`; modelo em `backend-moldes/.env.example`) e reinicie o backend.

## Dia a dia

```bash
garage bucket info muni-moldes   # quantidade de fotos e espaço usado
garage key info muni-moldes-backend --show-secret   # ver a chave de novo
```

- A API S3 só responde em `127.0.0.1:3900`. As fotos chegam ao navegador pelo backend, em `/uploads/<arquivo>`.
- Os dados ficam em `garage-data/` (fora do git). Backup = copiar essa pasta com o contêiner parado.
- Sem `S3_BUCKET` no `.env` do backend, as fotos voltam a ser gravadas em `backend-moldes/uploads`.
