import { Bcc } from '@bcc-sdk/core';
import { KeyManagement } from '../../src';

export const testKeyManager = () =>
  KeyManagement.createInMemoryKeyManager({
    mnemonicWords: KeyManagement.util.generateMnemonicWords(),
    password: '',
    networkId: Bcc.NetworkId.testnet
  });
