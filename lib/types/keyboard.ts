
export type KeyboardLayout = 'qwerty' | 'azerty';
export type KeyState = 'correct' | 'present' | 'absent' | 'empty';
export type KeyboardKey = {
  key: string;
  state: KeyState | 'unused';
};

export const KEYBOARD_LAYOUTS: Record<KeyboardLayout, KeyboardKey[][]> = {
  qwerty: [
    [
      { key: 'q', state: 'empty' },
      { key: 'w', state: 'empty' },
      { key: 'e', state: 'empty' },
      { key: 'r', state: 'empty' },
      { key: 't', state: 'empty' },
      { key: 'y', state: 'empty' },
      { key: 'u', state: 'empty' },
      { key: 'i', state: 'empty' },
      { key: 'o', state: 'empty' },
      { key: 'p', state: 'empty' },
    ],
    [
      { key: 'a', state: 'empty' },
      { key: 's', state: 'empty' },
      { key: 'd', state: 'empty' },
      { key: 'f', state: 'empty' },
      { key: 'g', state: 'empty' },
      { key: 'h', state: 'empty' },
      { key: 'j', state: 'empty' },
      { key: 'k', state: 'empty' },
      { key: 'l', state: 'empty' },
    ],
    [
      { key: 'Enter', state: 'empty' },
      { key: 'z', state: 'empty' },
      { key: 'x', state: 'empty' },
      { key: 'c', state: 'empty' },
      { key: 'v', state: 'empty' },
      { key: 'b', state: 'empty' },
      { key: 'n', state: 'empty' },
      { key: 'm', state: 'empty' },
      { key: 'Backspace', state: 'empty' },
    ],
  ],
  azerty: [
    [
      { key: 'a', state: 'empty' },
      { key: 'z', state: 'empty' },
      { key: 'e', state: 'empty' },
      { key: 'r', state: 'empty' },
      { key: 't', state: 'empty' },
      { key: 'y', state: 'empty' },
      { key: 'u', state: 'empty' },
      { key: 'i', state: 'empty' },
      { key: 'o', state: 'empty' },
      { key: 'p', state: 'empty' },
    ],
    [
      { key: 'q', state: 'empty' },
      { key: 's', state: 'empty' },
      { key: 'd', state: 'empty' },
      { key: 'f', state: 'empty' },
      { key: 'g', state: 'empty' },
      { key: 'h', state: 'empty' },
      { key: 'j', state: 'empty' },
      { key: 'k', state: 'empty' },
      { key: 'l', state: 'empty' },
      { key: 'm', state: 'empty' },
    ],
    [
      { key: 'Enter', state: 'empty' },
      { key: 'w', state: 'empty' },
      { key: 'x', state: 'empty' },
      { key: 'c', state: 'empty' },
      { key: 'v', state: 'empty' },
      { key: 'b', state: 'empty' },
      { key: 'n', state: 'empty' },
      { key: 'Backspace', state: 'empty' },
    ],
  ],
};