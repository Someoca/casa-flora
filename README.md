# Casa Flora

Vitrine independente em português para O Boticário, Eudora, quem disse, berenice? e O.U.i, com apresentação das marcas, busca, filtros, ordenação por preço/nome, links para as lojas oficiais e sacola demonstrativa. A pasta é independente do projeto HADES Store.

## Executar

Abra `index.html` em um navegador. Não há dependências de build ou instalação. Para usar um feed remoto, sirva a pasta por HTTP(S) e habilite CORS na origem do feed.

## Visualizar online

Site público: https://someoca.github.io/casa-flora/

O GitHub Pages publica os arquivos estáticos deste projeto automaticamente a cada atualização na branch `main`. A primeira publicação pode levar alguns minutos para ficar disponível.

## Catálogo do cliente e atendimento VIP

Abra `catalogo.html` para uma página de catálogo própria para clientes, com busca, filtros por marca/categoria, ordenação, links oficiais e a opção **Imprimir / salvar PDF** do navegador. A página usa a mesma seleção local ou o feed remoto configurado para a loja. Para compartilhar um link com clientes, publique a pasta completa em uma hospedagem HTTPS; abrir os arquivos localmente não cria um endereço público.

O botão flutuante **Atendimento VIP** abre o WhatsApp `+55 19 99378-7673` com uma mensagem pronta e, quando a Casa Flora está hospedada em um domínio público HTTP(S), o endereço do catálogo. Em prévias locais o link público não é incluído. O WhatsApp pede que a pessoa confirme o envio; o site não envia mensagens automaticamente.

## Catálogo e preços

`catalog.js` contém uma seleção de 160 produtos (40 por marca), conferidos em 12/11/2026 às 14:36 (horário de Brasília). Os nomes, links e preços exibidos foram observados nas páginas oficiais naquela consulta. Esta lista é uma amostra e não um catálogo completo; não confirma estoque e não garante que promoções continuem válidas.

Os preços têm o horário da consulta e só são exibidos por 24 horas; depois disso, a vitrine mantém os produtos, oculta os valores e direciona o cliente à página oficial para consultar o preço vigente. As fontes consultadas foram:

- O Boticário — [perfumaria Lily](https://www.boticario.com.br/lily/perfumaria/) e [perfumaria Malbec](https://www.boticario.com.br/malbec/perfumaria/)
- Eudora — [perfumaria](https://www.eudora.com.br/perfumaria/) e [produtos Siàge](https://www.eudora.com.br/siage/)
- quem disse, berenice? — [batons](https://www.quemdisseberenice.com.br/maquiagem/boca/batom/) e [maquiagem](https://www.quemdisseberenice.com.br/maquiagem/)
- O.U.i — [todos os produtos](https://www.ouiparis.com/loja/todos-os-produtos/) e [perfumaria masculina](https://www.ouiparis.com/perfumaria/masculino/)

Nenhuma imagem ou descrição promocional foi copiada. Confira preço, disponibilidade, pagamento e entrega na loja oficial antes de concluir qualquer compra.

Quando o feed não fornece uma imagem autorizada, as vitrines mostram ilustrações conceituais locais por categoria e marca. Elas não são fotos nem reproduções das embalagens reais.

Para substituir ou atualizar essa seleção por uma fonte autorizada, configure a URL pública HTTPS do JSON em `store-config.js`. Sem uma URL configurada, os dados vêm de `catalog.js`. O formato esperado:

```js
window.CASA_FLORA_CATALOG = {
  updatedAt: "<data de atualização informada pela fonte>",
  source: "<identificação da fonte autorizada>",
  items: [
    {
      id: "<id único do produto>",
      brand: "boticario",
      name: "<nome confirmado do produto>",
      category: "Perfumes",
      price: null,
      currency: "BRL",
      priceVerifiedAt: null,
      productUrl: "<URL HTTPS do produto no domínio oficial>",
      volume: "<volume confirmado, opcional>",
      image: "<URL HTTPS de imagem autorizada, opcional>"
    }
  ]
};
```

O feed remoto deve retornar o mesmo objeto JSON, sem o prefixo `window.CASA_FLORA_CATALOG =`. `brand` aceita `boticario`, `eudora`, `qdb` ou `oui`. Cada produto precisa de ID único, marca, nome, categoria, um campo `price` numérico ou `null` e URL HTTPS de produto no domínio associado à marca. Quando `price` contém um número, `currency` deve ser `BRL` e `priceVerifiedAt` deve ser uma data ISO recente; o preço só aparece quando a conferência ocorreu nas últimas 24 horas. Valores sem data válida, vencidos ou futuros não são apresentados nem podem ser adicionados à sacola. Se o feed estiver inválido ou indisponível, a vitrine exibe o erro e não recorre silenciosamente a dados demonstrativos. Imagens são opcionais e só devem ser usadas quando a fonte autorizar.

O site valida o formato, o domínio do link e a idade informada do preço, mas não consegue confirmar que a fonte diz a verdade, que o catálogo está completo ou que o estoque ainda existe. A marca, a fonte e os preços continuam precisando de conferência do responsável pelo catálogo. Os links de marca são destinos de navegação; verifique-os antes da publicação. Confirme preço, disponibilidade, pagamento e entrega na loja oficial. A sacola apenas demonstra a experiência: não reserva estoque, não processa pagamento e não envia pedidos.
