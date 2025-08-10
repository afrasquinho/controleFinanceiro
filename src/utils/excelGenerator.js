
import * as XLSX from 'xlsx';
import { mesesInfo, gastosFixosDefault, valoresDefault } from '../data/monthsData';
import { calculateRendimentos, calculateSaldo } from './calculations';

export const generateExcel = (gastosData) => {
  const wb = XLSX.utils.book_new();
  
  // Criar aba para cada mês
  mesesInfo.forEach(mes => {
    const rendimentos = calculateRendimentos(mes.id);
    const saldoInfo = calculateSaldo(mes.id, gastosData[mes.id]);
    
    const wsData = [
      [`${mes.nome.toUpperCase()} - CONTROLE FINANCEIRO 2025`],
      [],
      ['RENDIMENTOS', '', '', '', ''],
      ['Fonte', 'Valor/Dia', 'Dias', 'IVA (23%)', 'Total Bruto'],
      [
        `Eu (${valoresDefault.valorEu}€ + IVA)`, 
        valoresDefault.valorEu, 
        mes.dias, 
        rendimentos.eu.iva.toFixed(2), 
        rendimentos.eu.total.toFixed(2)
      ],
      [
        `Esposa (${valoresDefault.valorEsposa}€ + IVA)`, 
        valoresDefault.valorEsposa, 
        mes.dias, 
        rendimentos.esposa.iva.toFixed(2), 
        rendimentos.esposa.total.toFixed(2)
      ],
      ['TOTAL RENDIMENTOS', '', '', '', rendimentos.total.toFixed(2)],
      [],
      ['GASTOS FIXOS', ''],
      ['Categoria', 'Valor'],
      ['Água', gastosFixosDefault.agua],
      ['Luz', gastosFixosDefault.luz],
      ['Internet', gastosFixosDefault.internet],
      ['Renda', gastosFixosDefault.renda],
      ['SUBTOTAL FIXOS', saldoInfo.gastosFixos.toFixed(2)],
      [],
      ['GASTOS VARIÁVEIS', '', ''],
      ['Data', 'Descrição', 'Valor']
    ];
    
    // Adicionar gastos variáveis
    gastosData[mes.id].forEach(gasto => {
      wsData.push([gasto.data, gasto.desc, gasto.valor.toFixed(2)]);
    });
    
    wsData.push(['SUBTOTAL VARIÁVEIS', '', saldoInfo.gastosVariaveis.toFixed(2)]);
    wsData.push([]);
    wsData.push(['RESULTADO DO MÊS', '', '']);
    wsData.push(['Rendimentos:', '', saldoInfo.rendimentos.toFixed(2)]);
    wsData.push(['Gastos Fixos:', '', saldoInfo.gastosFixos.toFixed(2)]);
    wsData.push(['Gastos Variáveis:', '', saldoInfo.gastosVariaveis.toFixed(2)]);
    wsData.push(['Gastos Totais:', '', saldoInfo.gastosTotal.toFixed(2)]);
    wsData.push(['SALDO:', '', saldoInfo.saldo.toFixed(2)]);
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Formatação das células
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Aplicar formatação aos cabeçalhos
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[cell_address]) continue;
        
        // Formatação para totais
        if (ws[cell_address].v && typeof ws[cell_address].v === 'string') {
          if (ws[cell_address].v.includes('TOTAL') || 
              ws[cell_address].v.includes('SUBTOTAL') ||
              ws[cell_address].v.includes('SALDO:')) {
            ws[cell_address].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "E8F4FD" } }
            };
          }
        }
      }
    }
    
    // Definir largura das colunas
    ws['!cols'] = [
      { wch: 25 }, // Coluna A - Descrições
      { wch: 12 }, // Coluna B - Valores
      { wch: 8 },  // Coluna C - Dias
      { wch: 12 }, // Coluna D - IVA
      { wch: 15 }  // Coluna E - Total
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, mes.nome);
  });
  
  // Criar aba resumo anual
  const resumoData = [
    ['RESUMO ANUAL 2025'],
    [],
    ['Mês', 'Dias Úteis', 'Rendimentos', 'Gastos Fixos', 'Gastos Variáveis', 'Gastos Totais', 'Saldo']
  ];
  
  let totalAnualRend = 0;
  let totalAnualGastoFixo = 0;
  let totalAnualGastoVar = 0;
  let totalAnualGasto = 0;
  let totalAnualSaldo = 0;
  
  mesesInfo.forEach(mes => {
    const saldoInfo = calculateSaldo(mes.id, gastosData[mes.id]);
    
    resumoData.push([
      mes.nome,
      mes.dias,
      saldoInfo.rendimentos.toFixed(2),
      saldoInfo.gastosFixos.toFixed(2),
      saldoInfo.gastosVariaveis.toFixed(2),
      saldoInfo.gastosTotal.toFixed(2),
      saldoInfo.saldo.toFixed(2)
    ]);
    
    totalAnualRend += saldoInfo.rendimentos;
    totalAnualGastoFixo += saldoInfo.gastosFixos;
    totalAnualGastoVar += saldoInfo.gastosVariaveis;
    totalAnualGasto += saldoInfo.gastosTotal;
    totalAnualSaldo += saldoInfo.saldo;
  });
  
  resumoData.push([]);
  resumoData.push([
    'TOTAL ANUAL',
    mesesInfo.reduce((total, mes) => total + mes.dias, 0),
    totalAnualRend.toFixed(2),
    totalAnualGastoFixo.toFixed(2),
    totalAnualGastoVar.toFixed(2),
    totalAnualGasto.toFixed(2),
    totalAnualSaldo.toFixed(2)
  ]);
  
  // Adicionar estatísticas
  resumoData.push([]);
  resumoData.push(['ESTATÍSTICAS ANUAIS']);
  resumoData.push(['Média mensal de rendimentos:', '', (totalAnualRend / 12).toFixed(2)]);
  resumoData.push(['Média mensal de gastos:', '', (totalAnualGasto / 12).toFixed(2)]);
  resumoData.push(['Média mensal de saldo:', '', (totalAnualSaldo / 12).toFixed(2)]);
  resumoData.push(['Percentual de gastos fixos:', '', ((totalAnualGastoFixo / totalAnualGasto) * 100).toFixed(1) + '%']);
  resumoData.push(['Percentual de gastos variáveis:', '', ((totalAnualGastoVar / totalAnualGasto) * 100).toFixed(1) + '%']);
  resumoData.push(['Taxa de poupança anual:', '', ((totalAnualSaldo / totalAnualRend) * 100).toFixed(1) + '%']);
  
  const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
  
  // Formatação da aba resumo
  wsResumo['!cols'] = [
    { wch: 15 }, // Mês
    { wch: 12 }, // Dias
    { wch: 15 }, // Rendimentos
    { wch: 15 }, // Gastos Fixos
    { wch: 18 }, // Gastos Variáveis
    { wch: 15 }, // Gastos Totais
    { wch: 15 }  // Saldo
  ];
  
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Anual');
  
  // Criar aba de gráficos (dados para gráficos)
  const graficosData = [
    ['DADOS PARA GRÁFICOS'],
    [],
    ['Mês', 'Rendimentos', 'Gastos', 'Saldo'],
    ...mesesInfo.map(mes => {
      const saldoInfo = calculateSaldo(mes.id, gastosData[mes.id]);
      return [
        mes.nome,
        saldoInfo.rendimentos,
        saldoInfo.gastosTotal,
        saldoInfo.saldo
      ];
    }),
    [],
    ['EVOLUÇÃO MENSAL DE GASTOS VARIÁVEIS'],
    ['Mês', 'Gastos Variáveis'],
    ...mesesInfo.map(mes => [
      mes.nome,
      calculateSaldo(mes.id, gastosData[mes.id]).gastosVariaveis
    ])
  ];
  
  const wsGraficos = XLSX.utils.aoa_to_sheet(graficosData);
  XLSX.utils.book_append_sheet(wb, wsGraficos, 'Dados Gráficos');
  
  // Salvar arquivo
  const fileName = `Controle_Financeiro_2025_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  return fileName;
};

// Função para gerar relatório específico de um mês
export const generateMonthReport = (mesId, gastosData) => {
  const mes = mesesInfo.find(m => m.id === mesId);
  const rendimentos = calculateRendimentos(mesId);
  const saldoInfo = calculateSaldo(mesId, gastosData[mesId]);
  
  const wb = XLSX.utils.book_new();
  
  const wsData = [
    [`RELATÓRIO DETALHADO - ${mes.nome.toUpperCase()} 2025`],
    [],
    ['ANÁLISE DE RENDIMENTOS'],
    ['Descrição', 'Valor'],
    [`Rendimento base (Eu): ${valoresDefault.valorEu}€ x ${mes.dias} dias`, rendimentos.eu.base.toFixed(2)],
    ['IVA sobre rendimento (Eu)', rendimentos.eu.iva.toFixed(2)],
    ['Total bruto (Eu)', rendimentos.eu.total.toFixed(2)],
    [],
    [`Rendimento base (Esposa): ${valoresDefault.valorEsposa}€ x ${mes.dias} dias`, rendimentos.esposa.base.toFixed(2)],
    ['IVA sobre rendimento (Esposa)', rendimentos.esposa.iva.toFixed(2)],
    ['Total bruto (Esposa)', rendimentos.esposa.total.toFixed(2)],
    [],
    ['TOTAL RENDIMENTOS DO MÊS', rendimentos.total.toFixed(2)],
    [],
    ['ANÁLISE DE GASTOS'],
    ['Categoria', 'Valor', 'Percentual do Total'],
    ['Gastos Fixos', saldoInfo.gastosFixos.toFixed(2), ((saldoInfo.gastosFixos / saldoInfo.gastosTotal) * 100).toFixed(1) + '%'],
    ['Gastos Variáveis', saldoInfo.gastosVariaveis.toFixed(2), ((saldoInfo.gastosVariaveis / saldoInfo.gastosTotal) * 100).toFixed(1) + '%'],
    ['TOTAL GASTOS', saldoInfo.gastosTotal.toFixed(2), '100%'],
    [],
    ['RESULTADO FINAL'],
    ['Rendimentos', saldoInfo.rendimentos.toFixed(2)],
    ['Gastos', saldoInfo.gastosTotal.toFixed(2)],
    ['SALDO', saldoInfo.saldo.toFixed(2)],
    ['Taxa de Poupança', ((saldoInfo.saldo / saldoInfo.rendimentos) * 100).toFixed(1) + '%'],
    [],
    ['DETALHAMENTO DOS GASTOS VARIÁVEIS'],
    ['Data', 'Descrição', 'Valor']
  ];
  
  // Adicionar gastos variáveis detalhados
  gastosData[mesId].forEach(gasto => {
    wsData.push([gasto.data, gasto.desc, gasto.valor.toFixed(2)]);
  });
  
  if (gastosData[mesId].length === 0) {
    wsData.push(['', 'Nenhum gasto variável registrado', '0,00']);
  }
  
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Formatação
  ws['!cols'] = [
    { wch: 35 }, // Descrição
    { wch: 15 }, // Valor
    { wch: 18 }  // Percentual
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, `Relatório ${mes.nome}`);
  
  const fileName = `Relatorio_${mes.nome}_2025_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  return fileName;
};
