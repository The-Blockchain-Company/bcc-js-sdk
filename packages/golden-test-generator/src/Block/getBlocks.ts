/* eslint-disable sonarjs/cognitive-complexity */
import { Logger, dummyLogger } from 'ts-log';
import {
  ConnectionConfig,
  createChainSyncClient,
  createInteractionContext,
  StateQuery,
  isEvieBlock,
  isAurumBlock,
  isSophieBlock,
  isJenBlock,
  Schema,
  ChainSync
} from '@bcc-ogmios/client';
import { GeneratorMetadata } from '../Content';

import { isColeStandardBlock } from '../util';

export type GetBlocksResponse = GeneratorMetadata & {
  blocks: { [blockHeight: string]: Schema.Block };
};

export const getBlocks = async (
  blockHeights: number[],
  options: {
    logger?: Logger;
    ogmiosConnectionConfig: ConnectionConfig;
    onBlock?: (slot: number) => void;
  }
): Promise<GetBlocksResponse> => {
  const logger = options?.logger ?? dummyLogger;
  const requestedBlocks: { [blockHeight: string]: Schema.Block } = {};
  return new Promise(async (resolve, reject) => {
    let currentBlock: number;
    // Required to ensure existing messages in the pipe are not processed after the completion condition is met
    let draining = false;
    const response: GetBlocksResponse = {
      metadata: {
        bcc: {
          compactGenesis: await StateQuery.genesisConfig(
            await createInteractionContext(reject, logger.info, { connection: options.ogmiosConnectionConfig })
          ),
          intersection: undefined as unknown as ChainSync.Intersection
        }
      },
      blocks: {}
    };
    try {
      const syncClient = await createChainSyncClient(
        await createInteractionContext(reject, logger.info, { connection: options.ogmiosConnectionConfig }),
        {
          rollBackward: async (_res, requestNext) => {
            requestNext();
          },
          rollForward: async ({ block }, requestNext) => {
            if (draining) return;
            let b:
              | Schema.StandardBlock
              | Schema.BlockSophie
              | Schema.BlockEvie
              | Schema.BlockJen
              | Schema.BlockAurum;
            if (isColeStandardBlock(block)) {
              b = block.cole as Schema.StandardBlock;
            } else if (isSophieBlock(block)) {
              b = block.sophie as Schema.BlockSophie;
            } else if (isEvieBlock(block)) {
              b = block.evie as Schema.BlockEvie;
            } else if (isJenBlock(block)) {
              b = block.jen as Schema.BlockJen;
            } else if (isAurumBlock(block)) {
              b = block.aurum as Schema.BlockAurum;
            } else {
              throw new Error('No support for block');
            }
            if (b !== undefined) {
              currentBlock = b.header!.blockHeight;
              if (options?.onBlock !== undefined) {
                options.onBlock(currentBlock);
              }
              if (blockHeights.includes(currentBlock)) {
                requestedBlocks[currentBlock] = block;
                if (blockHeights[blockHeights.length - 1] === currentBlock) {
                  draining = true;
                  response.blocks = requestedBlocks;
                  await syncClient.shutdown();
                  return resolve(response);
                }
              }
            }
            requestNext();
          }
        }
      );
      response.metadata.bcc.intersection = await syncClient.startSync(['origin']);
    } catch (error) {
      logger.error(error);
      return reject(error);
    }
  });
};
