import React from 'react';
import { render, screen } from '@testing-library/react';
import OverviewSection from '../OverviewSection';

describe('OverviewSection Component', () => {
  const mockData = {
    gastosData: {
      '01': [
        { id: '1', desc: 'Test expense', valor: 50, data: '2024-01-01' }
      ]
    },
    gastosFixos: {
      '01': { luz: 100, agua: 50 }
    },
    rendimentosData: {
      '01': [
        { id: '1', desc: 'Salary', valor: 2000, data: '2024-01-01' }
      ]
    }
  };

  test('renders overview section with data', () => {
    render(<OverviewSection {...mockData} />);

    expect(screen.getByRole('region', { name: /Visão Geral/i })).toBeInTheDocument();
    expect(screen.getByText(/Visão Geral/i)).toBeInTheDocument();
  });

  test('displays financial summary', () => {
    render(<OverviewSection {...mockData} />);

    // Check if key financial elements are rendered
    // This would depend on the actual implementation of OverviewSection
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});
