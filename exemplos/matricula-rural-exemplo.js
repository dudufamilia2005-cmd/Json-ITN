/**
 * Exemplo RURAL sintetico, para demonstrar a ferramenta sem expor dado real.
 *
 * Nomes, CPF/CNPJ e codigos de cadastro sao ficticios (os CPF/CNPJ tem digito
 * verificador valido, para o conversor nao acusar erro). O formato do texto,
 * porem, imita fielmente o acervo: divisorias de tracos, cabecalho em caixa
 * mista ("Av.5"), tabela de titularidade citando atos, data por extenso e no
 * formato dd.mm.aaaa, valores que NAO sao transacao, e um ato cadastral sem
 * nenhuma parte qualificada.
 *
 * A suite de testes de verdade roda contra matriculas reais, que nao sao
 * publicadas - ver README, secao "Testes".
 */
window.EXEMPLO_RURAL = [
'MATRÍCULA 1.234, Morrinhos, 19 de maio de 1977. IMÓVEL: Fazenda Boa Esperança, neste Município, constituído de: casa de morada, currais e benfeitorias; e, seu respectivo terreno, totalizando: 60,0000 alqueires, correspondentes a 290,4000 hectares, confrontando com terras de Antônio Ferreira da Costa, ao Norte; Sebastião Alves Pinto, ao Sul; João Batista de Oliveira, ao Leste; e com, Maria Rita do Carmo, ao Oeste. Cadastrado no INCRA sob o Nº 123.456.789.012-3. PROPRIETÁRIOS: JOÃO DA SILVA, brasileiro, agricultor, casado com MARIA DA SILVA pelo regime da comunhão de bens, inscrito no CPF sob o Nº 111.444.777-35, residente e domiciliado na Praça Central, nesta Cidade.',
'----------------------------------------------------------------------------',
'R-1-1.234 - Morrinhos, 19 de maio de 1977. Emitentes: João da Silva e sua mulher Maria da Silva, ambos brasileiros, casados pelo regime da comunhão de bens, inscrito no CPF sob o Nº 111.444.777-35, residentes e domiciliados na Praça Central, nesta Cidade. Financiador: Banco Exemplo S/A, Agência local, inscrito no CNPJ sob o Nº 11.222.333/0001-81. Título: Cédula Rural Pignoratícia e Hipotecária, emitida em 19 de maio de 1977. Valor Cr$ 100.000,00 (cem mil cruzeiros). Objeto da garantia: Em hipoteca cedular de 1º grau, o imóvel objeto desta matrícula.',
'----------------------------------------------------------------------------',
'AV-2-1.234 - Morrinhos, 09 de outubro de 1986. CANCELAMENTO DE HIPOTECA POR QUITAÇÃO DADA PELO CREDOR: Certifica que se procede a esta averbação nos termos do recibo firmado pelo credor Banco Exemplo S/A, para que o R-1-1.234 fique cancelado, visto ter o devedor solvido a totalidade de seu débito. Dou fé.',
'----------------------------------------------------------------------------',
'R-3-1.234 - Morrinhos, 08 de maio de 1997. Nos termos da Escritura Pública de Compra e Venda de 24 de abril de 1997, lavrada pelo Tabelionato 1º de Notas local, PEDRO SOUZA LIMA, brasileiro, agropecuarista, casado com ANA SOUZA LIMA sob o regime da comunhão universal de bens, anterior à vigência da Lei 6.515/77, inscrito no CPF sob o Nº 222.333.444-05, adquiriu por compra feita a JOÃO DA SILVA, agricultor, e sua mulher MARIA DA SILVA, do lar, ambos brasileiros, portadores do CPF Nº 111.444.777-35, uma parte ideal correspondente a 100,0000 hectares, no imóvel objeto da presente matrícula; pelo preço de R$45.000,00 (quarenta e cinco mil reais). Dou fé.',
'----------------------------------------------------------------------------',
'AV.4-1.234- Em: 27.02.2015. INDICAÇÃO RELAÇÃO TITULARIDADE. - Procede-se a presente averbação, de ofício, a fim de esclarecer melhor o domínio do imóvel total descrito nesta matrícula que, atualmente, pertence aos seguintes co-proprietários na proporção indicada nos elementos a seguir:',
'CO-PROPRIETÁRIO ATO PERCENTUAL (%) CORRESPONDÊNCIA NA ÁREA (EM HECTARES)',
'Matr. João da Silva 65,56% 190,4000ha',
'R-3 Pedro Souza Lima 34,44% 100,0000ha',
'Total 02 proprietários 100% 290,4000ha',
'DOU FÉ. Morrinhos-GO, 27 de fevereiro de 2015. Oficial:',
'----------------------------------------------------------------------------',
'Av.5-1.234 - Data: 04.12.2015. Protocolo n.º 100.014. CANCELAMENTO DE HIPOTECA - Nos termos da Carta de Liberação de Garantia, firmada pelo credor BANCO EXEMPLO S/A, procede-se a presente averbação de acordo com o disposto no art. 251, I, da Lei Federal 6.015/1973. DOU FÉ. Cotação do ato: emolumentos: R$34,15; taxa judiciária: R$11,42.',
'----------------------------------------------------------------------------',
'AV.6-1.234 - Data: 10.03.2026. Protocolo n.º 181.875, de 23.02.2026. INSCRIÇÃO NO CAR. Nos termos do requerimento do interessado, procede-se a presente averbação para constar que o imóvel Fazenda Boa Esperança, situado na zona rural deste município de Morrinhos-GO, objeto da presente matrícula foi inscrito no Cadastro Ambiental Rural - CAR sob o n.º de registro GO-5213806-AAAA-BBBB-CCCC-DDDD-EEEE-FFFF-1111-2222, cadastrado em 17.09.2025, apresentando as seguintes informações de caráter declaratório: coordenadas geográficas do Centróide: latitude: -17.700000000000000 e longitude: -48.800000000000000; área total(ha): 290,3000; área de reserva legal: 58,0800. DOU FÉ.',
'----------------------------------------------------------------------------',
'AV.7-1.234 - Data: 10.03.2026. Protocolo n.º 181.876, de 02.01.2026. CÓDIGO DE ENDEREÇAMENTO POSTAL. Nos termos do requerimento firmado pelo interessado, procede-se a esta averbação com base no art.440-AV, parágrafo único, do Provimento n.º 149/2023 do Conselho Nacional de Justiça, para constar que o imóvel objeto da presente matrícula possui o seguinte Código de Endereçamento Postal - CEP n.º 75.650-000. DOU FÉ.',
'----------------------------------------------------------------------------',
'AV.8-1.234 - Data: 10.03.2026. Protocolo n.º 181.874, de 23.02.2026. ATUALIZAÇÃO DO CERTIFICADO DE CADASTRO DE IMÓVEL RURAL - CCIR E CADASTRO IMOBILIÁRIO BRASILEIRO - CIB. Nos termos do requerimento do interessado, procede-se a esta averbação para constar os dados atualizados constantes do Certificado de Cadastro de Imóvel Rural – CCIR, referente ao imóvel objeto da presente matrícula, sendo: n.º 12345678901, emissão exercício 2025, gerado em 13.02.2026; declarante: João da Silva; código do imóvel rural: 123.456.789.012-3; denominação do imóvel rural: Fazenda Boa Esperança; área total: 290,4000ha; classificação fundiária: Média propriedade Produtiva; área certificada: 0,0000ha; módulo fiscal: 40,0000ha; e, II)- Certidão Negativa de Débitos Relativos aos Tributos Federais e à Dívida Ativa da União de Imóvel Rural (ITR), CIB: 1.234.567-8, emitida em 26.12.2025. DOU FÉ.',
'----------------------------------------------------------------------------',
'R.9-1.234 - Data: 14.05.2026. Protocolo n.º 183.167, de 05.05.2026. VENDA E COMPRA. TRANSMITENTE: Pedro Souza Lima, brasileiro, casado, agropecuarista, inscrito no CPF/MF sob o n.º 222.333.444-05, residente e domiciliado na Rua das Flores, n.º 100, Centro, Morrinhos-GO. ADQUIRENTE: Agro Exemplo Holding LTDA, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº 11.222.333/0001-81, com sede na Avenida Central, n.º 500, Setor Sul, Goiânia-GO, no ato representada por Carlos Alberto Nunes, brasileiro, casado, administrador, inscrito no CPF/MF sob o n.º 333.444.555-08. IMÓVEL: 34,44% do imóvel descrito na matrícula, equivalente a 100,0000ha. ORIGEM: O R-3 desta matrícula. FORMA DO TÍTULO: Escritura Pública de Venda e Compra, lavrada em 28.04.2026. VALOR: R$800.000,00 (oitocentos mil reais), quitados através de transferência bancária. *NOTAS: Constou da Escritura: I)- o recolhimento do Imposto Sobre a Transmissão de Bens Imóveis - ITBI em data de 07.04.2026; Base de cálculo: R$1.000.000,00; Valor recolhido: R$30.000,00. DOU FÉ. Cotação do ato: emolumentos: R$6810,51; ISSQN: R$340,53; taxa judiciária: R$20,62.',
'----------------------------------------------------------------------------',
].join('\n');
