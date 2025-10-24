import { renderHook, act } from '@testing-library/react';
import { useUnifiedFirestore } from './useUnifiedFirestore.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

describe('useUnifiedFirestore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null userId and loading true', () => {
    const { result } = renderHook(() => useUnifiedFirestore());
    expect(result.current.userId).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should set userId on auth state change', () => {
    let authCallback;
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useUnifiedFirestore());

    act(() => {
      authCallback({ uid: 'user123' });
    });

    expect(result.current.userId).toBe('user123');

    act(() => {
      authCallback(null);
    });

    expect(result.current.userId).toBeNull();
  });

  it('should add and remove gasto', async () => {
    const setDocMock = setDoc.mockResolvedValue();
    const deleteDocMock = deleteDoc.mockResolvedValue();

    const { result, waitForNextUpdate } = renderHook(() => useUnifiedFirestore());

    // Mock mesesPath to avoid early return
    act(() => {
      result.current.userId = 'user123';
    });

    // Add gasto
    await act(async () => {
      await result.current.addGasto('01', '2023-01-01', 'Test desc', '100');
    });

    expect(setDocMock).toHaveBeenCalled();

    // Remove gasto
    await act(async () => {
      await result.current.removeGasto('01', 'gasto_123');
    });

    expect(deleteDocMock).toHaveBeenCalled();
  });

  // Additional tests for other actions can be added similarly
});
