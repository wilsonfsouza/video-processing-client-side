# Pre-processing videos on browsers

## Preview
<img width=100% src="./initial-template/demo.gif">

## Pre-requirements
- Node.js v18.17.0
- Linux

## Running
- Execute `npm ci` na pasta que contém o arquivo `package.json` para restaurar os pacotes
- Execute `npm start` e em seguida vá para o seu navegador em [http://localhost:3000](http://localhost:3000) para visualizar a página acima

## Checklist Features

- Video Uploader
  - [] - Deve entender videos em formato MP4 mesmo se não estiverem fragmentados
  - [] - Deve processar itens em threads isoladas com Web Workers
  - [] - Deve converter fragmentos de videos em formato `144p`
  - [] - Deve renderizar frames em tempo real em elemento canvas
  - [] - Deve gerar arquivos WebM a partir de fragmentos

### Desafios
- [] - Encodar em 360p e 720p
- [] - Fazer encoding/decoding track de áudio
- [] - Fazer também upload de track de áudio
- [] - Concatenar o arquivo final no servidor em um arquivo só
- [] - Corrigir problema do Webm de não mostrar a duração do video
- [] - Corrigir a responsividade do site
- [] - Tentar usar outros muxers
  - https://github.com/Vanilagy/webm-muxer
  - https://github.com/Vanilagy/mp4-muxer



### Reference Table
- Reuni todos os links em [referências](./referencias.md)

### FAQ
- browser-sync está lançando erros no Windows e nunca inicializa:
  - Solução: Trocar o browser-sync pelo http-server.
    1. instale o **http-server**  com `npm i -D http-server`
    2. no package.json apague todo o comando do `browser-sync` e substitua por `npx http-server .`
    3. agora o projeto vai estar executando na :8080 então vá no navegador e tente acessar o http://localhost:8080/
  A unica coisa, é que o projeto não vai reiniciar quando voce alterar algum código, vai precisar dar um F5 na página toda vez que alterar algo

