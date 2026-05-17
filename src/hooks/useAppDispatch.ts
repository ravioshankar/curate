// useAppDispatch.ts - Redux dispatch hook for type safety
import { AppDispatch } from '@/src/store/store';
import { useDispatch } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
