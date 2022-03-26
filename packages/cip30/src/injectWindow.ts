import { Wallet, WalletPublic } from './Wallet';
import { dummyLogger, Logger } from 'ts-log';

export type WindowMaybeWithBcc = Window & { bcc?: { [k: string]: WalletPublic } };

export const injectWindow = (window: WindowMaybeWithBcc, wallet: Wallet, logger: Logger = dummyLogger): void => {
  if (!window.bcc) {
    logger.debug(
      {
        module: 'injectWindow',
        wallet: { name: wallet.name, version: wallet.version }
      },
      'Creating bcc global scope'
    );
    window.bcc = {};
  } else {
    logger.debug(
      {
        module: 'injectWindow',
        wallet: { name: wallet.name, version: wallet.version }
      },
      'Bcc global scope exists'
    );
  }
  window.bcc[wallet.name] = window.bcc[wallet.name] || wallet.getPublicApi(window);
  logger.debug(
    {
      module: 'injectWindow',
      wallet: { name: wallet.name, version: wallet.version },
      windowBcc: window.bcc
    },
    'Injected'
  );
};
