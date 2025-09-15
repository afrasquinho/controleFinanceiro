import React from 'react';
import RendimentosSection from './RendimentosSection';
import { mesesInfo } from '../data/monthsData';

const TestRendimentos = () => {
  // Use the first month for testing
  const testMonth = mesesInfo[0];
  
  return (
    <div>
      <h1>Teste de Rendimentos</h1>
      <RendimentosSection mes={testMonth} />
    </div>
  );
};

export default TestRendimentos;
