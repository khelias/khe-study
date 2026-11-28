import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Sticker } from '../Sticker';
import { PATH_STICKER_IDS } from '../../../meta/stickers';

describe('Sticker', () => {
  it('draws every sticker of the path set', () => {
    for (const id of PATH_STICKER_IDS) {
      const { container, unmount } = render(<Sticker id={id} />);
      expect(container.querySelector('svg'), id).not.toBeNull();
      unmount();
    }
  });

  it('shows an empty place for no sticker or an unknown one', () => {
    for (const id of [null, 'retired']) {
      const { container, unmount } = render(<Sticker id={id} />);
      expect(container.querySelector('svg')).toBeNull();
      expect(container.firstElementChild).toHaveClass('border-dashed');
      unmount();
    }
  });
});
