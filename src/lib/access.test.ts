import { describe, expect, it } from 'vitest';
import { actorFromSession, can, roleFromCapabilities } from './access';

describe('roleFromCapabilities', () => {
  it('picks the highest role set to true and ignores junk', () => {
    expect(roleFromCapabilities('{"author":true,"editor":true}')).toBe('editor');
    expect(roleFromCapabilities('{"editor":false,"author":true}')).toBe('author');
    expect(roleFromCapabilities('{"superuser":true}')).toBe('subscriber');
    expect(roleFromCapabilities('not json')).toBe('subscriber');
    expect(roleFromCapabilities(undefined)).toBe('subscriber');
  });
});

describe('actorFromSession', () => {
  it('needs a numeric id and falls back to subscriber for unknown roles', () => {
    expect(actorFromSession({ id: '7', role: 'editor' })).toEqual({ id: 7, role: 'editor' });
    expect(actorFromSession({ id: '7', role: 'root' })).toEqual({ id: 7, role: 'subscriber' });
    expect(actorFromSession({ id: 'abc', role: 'editor' })).toBeNull();
    expect(actorFromSession(null)).toBeNull();
  });
});

describe('can', () => {
  it('follows the role table', () => {
    expect(can({ id: 1, role: 'author' }, 'publish_posts')).toBe(true);
    expect(can({ id: 1, role: 'contributor' }, 'publish_posts')).toBe(false);
    expect(can({ id: 1, role: 'editor' }, 'manage_options')).toBe(false);
    expect(can(null, 'read')).toBe(false);
  });
});
