# LinkedIn — publicação em português

> **Antes de publicar:** o deploy está no ar e verificado (https://pricepilot-eta.vercel.app).
> O repositório no GitHub **ainda não foi criado** — confirme a URL real
> antes de postar ou tire a linha. Não publique link que não existe.

---

Projeto 2 do meu desafio de 60 soluções em 30 dias: **PricePilot**, uma
calculadora de precificação.

**O problema**

Quem vende por aplicativo de entrega, marketplace ou maquininha é cobrado por
duas coisas que não são a mesma, e confundir as duas é o que come a margem
sem ninguém perceber:

Custo é valor por unidade. Ingrediente, material, o pedaço do aluguel que
aquela venda precisa carregar.

Taxa é percentual **sobre o preço de venda**. A taxa do cartão, a comissão do
marketplace, o imposto sobre faturamento.

Taxa não pode ser somada ao custo antes de o preço existir, porque ela é um
percentual da resposta. Quem contorna isso aplicando um markup redondo fica
sem saber onde fica o piso, ou seja, abaixo de qual preço está pagando para
vender.

**A solução**

Uma tela só. Custos e taxas de um lado, preço e o que sobra dele do outro,
recalculando enquanto você digita. Embaixo, um slider de desconto que diz na
hora se a venda ainda dá lucro, e a mesma estrutura de custo comparada em três
margens diferentes.

Tudo roda no navegador. Sem conta, sem servidor, sem dado saindo do aparelho.

**Decisões técnicas que mudaram o resultado**

Dinheiro é centavo inteiro do começo ao fim. Nenhum float segura valor em
nenhum ponto.

O preço arredonda para cima, nunca para baixo. Arredondar para baixo devolve
um preço que entrega menos margem do que a pedida, e essa é a única direção em
que uma ferramenta de precificação não pode errar.

O motor de cálculo é puro: entra um input, sai um resultado ou `null`. Sem
React dentro, sem formatação, sem exceção. Entrada impossível (taxas somando
100%, por exemplo) é um problema tipado com explicação própria, não um erro
jogado na tela nem um NaN.

**O que deu trabalho de verdade**

O scaffold do Vite vinha com `strict` desligado no tsconfig. Escrevi e revisei
o motor inteiro embaixo de um compilador que não estava conferindo quase nada.
Ligar depois revelou erros reais. Virou item de checklist em scaffold novo.

Três defeitos de acessibilidade que só o navegador achou, com TypeScript,
lint e 60 testes todos verdes: uma `<dl>` com `<dt>` aninhado fundo demais,
a tabela de cenários com rolagem horizontal inalcançável por teclado em 390px,
e um texto de apoio reprovando contraste a 80% de opacidade.

Duas live regions brigando. O elemento `<output>` já tem role `status`
implícito, então o valor do slider e o resultado do desconto anunciavam juntos
a cada arrasto.

**Aprendizado**

Teste de unidade e tipagem não substituem rodar a coisa no navegador. Os três
defeitos de acessibilidade estavam lá com tudo verde. Por isso a verificação
virou script versionado: axe-core em quatro larguras a cada rodada, não uma
auditoria de uma vez só.

**Verificado em 14/10/2026**

77 testes passando, TypeScript strict limpo, build limpo, zero violações
axe-core (WCAG 2.1 A + AA) em 1440, 768, 390 e 320px, sem overflow horizontal
e sem erro de console.

Os mesmos números valem contra o deploy no ar, não só contra build local.

Não verificado: aparelho iOS/Android real e leitor de tela.

Stack: React 19, TypeScript, Vite, Tailwind CSS v4, Vitest, Testing Library,
Playwright + axe-core.

No ar: https://pricepilot-eta.vercel.app
Código: [CONFIRMAR URL DO GITHUB ANTES DE POSTAR]

Se você precifica em cima de marketplace e quer trocar ideia sobre isso, é só
chamar.

#desenvolvimentoweb #react #typescript #acessibilidade
