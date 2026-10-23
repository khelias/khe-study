import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GAME_CONFIG, MECHANICS } from '../data';
import { MENU_PICTURES, menuPicture } from '../menuPictures';

describe('menu pictures', () => {
  it('resolve for every game, a variant through its mechanic', () => {
    for (const id of Object.keys(GAME_CONFIG)) expect(menuPicture(id), id).toBeDefined();
    expect(menuPicture('addition_snake')).toBe(MENU_PICTURES.math_snake);
  });

  it('exist for every mechanic card', () => {
    for (const id of Object.keys(MECHANICS)) expect(MENU_PICTURES[id], id).toBeDefined();
  });

  it.each(Object.entries(MENU_PICTURES))(
    '%s is one decorative svg on the token colours',
    (_id, Picture) => {
      const markup = renderToStaticMarkup(createElement(Picture));
      expect(markup.match(/<svg/g)).toHaveLength(1);
      expect(markup).toContain('viewBox="0 0 80 64"');
      expect(markup).toContain('aria-hidden="true"');
      expect(markup).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|style=|(fill|stroke)="(?!none)[^"]*"/i);
    },
  );
});
