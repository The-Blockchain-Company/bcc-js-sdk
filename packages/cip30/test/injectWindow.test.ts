import { mocks } from 'mock-browser';
import { Wallet } from '../src/Wallet';
import { api, properties, requestAccess } from './testWallet';
import { injectWindow, WindowMaybeWithBcc } from '../src/injectWindow';

describe('injectWindow', () => {
  let wallet: Wallet;
  let window: ReturnType<typeof mocks.MockBrowser>;

  beforeEach(() => {
    wallet = new Wallet(properties, api, requestAccess, { persistAllowList: false });
    window = mocks.MockBrowser.createWindow();
  });

  it('creates the bcc scope when not exists, and injects the wallet public API into it', async () => {
    expect(window.bcc).not.toBeDefined();
    injectWindow(window, wallet);
    expect(window.bcc).toBeDefined();
    expect(window.bcc[properties.name].name).toBe(properties.name);
    expect(await window.bcc[properties.name].isEnabled()).toBe(false);
    await window.bcc[properties.name].enable();
    expect(await window.bcc[properties.name].isEnabled()).toBe(true);
  });

  describe('existing bcc object', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let anotherObj: any;

    beforeEach(() => {
      anotherObj = { could: 'be', anything: 'here' };
      expect(window.bcc).not.toBeDefined();
      window.bcc = {} as WindowMaybeWithBcc;
      window.bcc['another-obj'] = anotherObj;
      expect(window.bcc).toBeDefined();
    });

    it('injects the wallet public API into the existing bcc scope', () => {
      expect(window.bcc).toBeDefined();
      injectWindow(window, wallet);
      expect(window.bcc[properties.name].name).toBe(properties.name);
      expect(Object.keys(window.bcc[properties.name])).toEqual(['name', 'version', 'enable', 'isEnabled']);
      expect(window.bcc['another-obj']).toBe(anotherObj);
    });
  });
});
