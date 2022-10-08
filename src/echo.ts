function echo(value: string) {
  if (value === 'echo') {
    return { error: 'error' };
  }
  return value;
}

export { echo };
