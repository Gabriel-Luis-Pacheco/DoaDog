import React from 'react';
import EmptyState from './EmptyState';

interface ErrorStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({
  title = 'Não foi possível carregar',
  message = 'Tente novamente em instantes.',
  actionLabel,
  onAction,
}: ErrorStateProps) {
  return <EmptyState icon="!" title={title} message={message} actionLabel={actionLabel} onAction={onAction} />;
}

export default ErrorState;

