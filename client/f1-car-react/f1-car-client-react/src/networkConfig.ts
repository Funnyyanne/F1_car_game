import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit"
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";
import { DEVNET_F1_CAR_GAME_PACKAGE_ID,
  MODULE_NAME
 } from "./constants";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });

// Function to get available cars
export async function getAvailableCars(client: SuiClient, ownerAddress: string) {
  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${DEVNET_F1_CAR_GAME_PACKAGE_ID}::${MODULE_NAME}::get_available_cars`,
    arguments: [txb.pure(ownerAddress)]
  });
  return await client.devInspectTransactionBlock({
    transactionBlock: txb,
    sender: ownerAddress
  });
}


//buy_game_tokens


export { useNetworkVariable, useNetworkVariables, networkConfig };
