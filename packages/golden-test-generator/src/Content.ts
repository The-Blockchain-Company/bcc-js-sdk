import { ChainSync, Schema as Bcc } from '@bcc-ogmios/client';
import { Commit } from 'git-last-commit';
import { getLastCommitPromise } from './util';
const packageJson = require('../package.json');

export type Metadata = {
  bcc: {
    compactGenesis: Bcc.CompactGenesis;
    intersection: ChainSync.Intersection;
  };
  software:  {
    name: string;
    version: string;
    commit: Pick<Commit, 'hash' | 'tags'>;
  };
};

export type GeneratorMetadata = { metadata: { bcc: Metadata['bcc'] } };

export const prepareContent = async <Body>(
  metadata: Omit<Metadata, 'software'>,
  body: Body
): Promise<{
  metadata: Metadata;
  body: Body;
}> => {
  const lastCommit = await getLastCommitPromise();
  return {
    metadata: {
      ...metadata,

      software: {
        name: packageJson.name,
        version: packageJson.version,
        commit: {
          hash: lastCommit.hash,
          tags: lastCommit.tags
        }
      }
    },
    body
  };
};
