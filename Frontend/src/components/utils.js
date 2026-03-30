function toClassName(value) {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(toClassName);
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([className]) => className);
  }

  return [];
}

export function cn(...values) {
  return values.flatMap(toClassName).join(' ');
}
