# Sound Warriors — Academia dos Sons

Jogo educativo para treinar consciência fonológica, discriminação auditiva e escrita correta através de missões, recompensas e progressão.

## Objetivo

Ajudar a criança a consolidar pares de sons/letras que ainda surgem com trocas na escrita espontânea, por exemplo:

- F/V
- S/Z
- B/P
- T/D
- CH/J
- C/G
- L/R

## Funcionalidades da versão inicial

- Mapa de mundos por cristal fonético.
- Missões rápidas com escolhas entre palavra correta e distrator.
- XP, moedas, níveis e combos.
- Cartas/recompensas desbloqueáveis.
- Laboratório do Mestre para registar erros reais.
- Exportação JSON dos erros registados.
- Progresso local por par fonético.
- Sem backend: os dados ficam no navegador através de `localStorage`.

## Publicação em Cloudflare Pages

1. Criar o repositório `RuiBanha72/sound-warriors` no GitHub.
2. Enviar estes ficheiros para a branch `main`.
3. No Cloudflare Pages:
   - Create application
   - Pages
   - Connect to Git
   - Escolher `RuiBanha72/sound-warriors`
   - Framework preset: `None`
   - Build command: deixar vazio
   - Build output directory: `/`
4. O domínio gratuito será do tipo:
   - `sound-warriors.pages.dev`

## Sobre `sound-warriors.dev`

`sound-warriors.dev` não é o domínio gratuito automático da Cloudflare Pages. É um domínio próprio `.dev`, que normalmente tem de ser comprado num registrar e depois ligado à Cloudflare.

Para custo zero, usar inicialmente:

`sound-warriors.pages.dev`

Mais tarde pode ser ligado:

- `sound-warriors.dev`
- `sons.crm.pt`
- `jogos.crm.pt`

## Próximos upgrades recomendados

- Perfil com PIN para o Mestre.
- Importação JSON de erros.
- Áudio gravado pelo adulto para cada palavra.
- Modo “ouve e escolhe”.
- Boss semanal com revisão espaçada.
- Backend com login e estatísticas entre dispositivos.
- Painel para criar campanhas completas.
