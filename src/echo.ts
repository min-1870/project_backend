function echo(value) {
  if (value.echo && value.echo === 'echo') {
    return { error: 'error' };
  }
  return value;
}

export { echo };
