import assert from 'assert';
import { interpolate } from './interpolate';

describe('interpolate', () => {
  it('null', () => {
    assert.strictEqual(interpolate(null, {}), '');
  });

  it('undefined', () => {
    assert.strictEqual(interpolate(undefined, {}), '');
  });

  it('empty', () => {
    assert.strictEqual(interpolate('', {}), '');
  });

  it('Simple', () => {
    assert.strictEqual(
      interpolate('Hello {{name}}', {
        name: 'David',
      }),
      'Hello David'
    );
  });

  it('Simple', () => {
    assert.strictEqual(
      interpolate('Hello {{$value}}', {
        $value: 'David',
      }),
      'Hello David'
    );
  });
});
