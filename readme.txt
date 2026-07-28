para banco de dados usamos o googlesheets

usamos o opensheet.elk.sh para converter em json
https://opensheet.elk.sh/1dUpN4a6PFuxnxCU1S_fTniiGmifhha8X3XfNYvszbjc/cardapio1

site converte para json -> https://opensheet.elk.sh/
id da planilha + nome da aba -> 1dUpN4a6PFuxnxCU1S_fTniiGmifhha8X3XfNYvszbjc/cardapio1

nao esquecer de habilitar no googlesheets a opção de compartilhar para publico, para que seja
possivel converter.

o retorno deve ser algo parecido com o exemplo a baixo:

{
    "comercio": "Delicias Fernandes",
    "categoria": "PIZZA",
    "nome": "Frango catupiry",
    "preco": "55.00",
    "img": "1BxsIxb8CST0--MLtrBGQafxm73t4Ij5E"
},

para imagens do google drive tambem usamos um link personalizado + id da imagem

https://lh3.googleusercontent.com/d/id da imagem,

o id da imagem é encontrado no link PUBLICO de compartilhamento, devendo a imagem 
estar autorizada e com status publica.