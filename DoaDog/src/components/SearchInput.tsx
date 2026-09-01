import React from 'react';
import AppInput from './AppInput';

interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Buscar por nome, cidade ou descrição',
}: SearchInputProps) {
  return (
    <AppInput
      label="Buscar"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      leftIcon="search"
      returnKeyType="search"
    />
  );
}

export default SearchInput;
