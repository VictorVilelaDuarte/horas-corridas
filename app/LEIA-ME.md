# Merecido — protótipo

App de recompensas por hábitos: cada objetivo (km, páginas, dias saudáveis…) rende saldo em uma recompensa de **tempo** (com cronômetro play/pause) ou de **itens/vales** (lanche, doce, R$).

- PWA instalável e offline (`manifest.webmanifest`, `sw.js`), sem build: HTML + CSS + JS puros.
- Dados só no aparelho (`localStorage`, chave `merecido.v1`), com exportar/importar backup em JSON.
- Importa os dados do app Corre & Joga (mesmo domínio) com um toque.

## O que tem
Onboarding com modelos prontos · vários objetivos com unidade e conversão próprias · registro por quantidade ou "feito hoje" · boosters (meta semanal, sequência, multiplicador por dia da semana) · penalidade opcional · validade do saldo (FIFO) · correção manual e histórico · gráficos e heatmap por objetivo · conquistas · PIN do responsável (modo família) · esboço do modo parceiro · tema claro/escuro.

Bônus e penalidades são calculados a partir dos registros (não ficam gravados), então apagar ou editar um registro recalcula tudo.
