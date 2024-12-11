import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";
import { DEVNET_F1_CAR_GAME_PACKAGE_ID } from "./constants";

const MODULE_NAME = "f1_car_game";

export interface Driver {
  id: string;
  name: string;
  team: string;
  skillLevel: number;
  price: number;
  available: boolean;
  url: string;
}

export interface Car {
  id: string;
  name: string;
  engineLevel: number;
  price: number;
  url: string;
}

export interface GameState {
  treasury: number;
  totalPool: number;
  maintenanceFund: number;
}

export interface RaceResult {
  position: number;
  reward: number;
}

export class F1GameContract {
  constructor(private client: SuiClient) {}

  // 购买游戏币
  async buyGameTokens(gameStateId: string, payment: string, amount: number) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${DEVNET_F1_CAR_GAME_PACKAGE_ID}::${MODULE_NAME}::buy_game_tokens`,
      arguments: [
        tx.object(gameStateId),
        tx.object(payment),
        tx.pure(amount),
      ],
    });

    return tx;
  }

  // 计算比赛结果
  async calculateRaceResult(
    gameStateId: string,
    carId: string,
    driverId: string
  ) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${DEVNET_F1_CAR_GAME_PACKAGE_ID}::${MODULE_NAME}::calculate_race_result`,
      arguments: [
        tx.object(carId),
        tx.object(driverId),
        tx.object(gameStateId),
      ],
    });

    return tx;
  }

  // 获取随机车辆信息
  async getRandomCarInfo(randomId: string, carLibraryId: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${DEVNET_F1_CAR_GAME_PACKAGE_ID}::${MODULE_NAME}::get_random_car_info`,
      arguments: [
        tx.object(randomId),
        tx.object(carLibraryId),
      ],
    });

    return tx;
  }

  // 更新车辆信息
  async updateCar(carId: string, url: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${DEVNET_F1_CAR_GAME_PACKAGE_ID}::${MODULE_NAME}::update_car`,
      arguments: [
        tx.object(carId),
        tx.pure(url),
      ],
    });

    return tx;
  }

  // 更新车手信息
  async updateDriver(driverId: string, url: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${DEVNET_F1_CAR_GAME_PACKAGE_ID}::${MODULE_NAME}::update_driver`,
      arguments: [
        tx.object(driverId),
        tx.pure(url),
      ],
    });

    return tx;
  }

  // 获取可用车手列表
  async getAvailableDrivers(driverLibraryId: string): Promise<Driver[]> {
    try {
      const driverLibrary = await this.client.getObject({
        id: driverLibraryId,
        options: {
          showContent: true,
        },
      });

      console.info(driverLibrary);

      const availableDrivers = driverLibrary.data?.content?.fields?.available_drivers || [];
      
      // 转换数据格式
      return availableDrivers.map((driver: any) => ({
        id: driver.fields.id.id,
        name: driver.fields.name,
        team: driver.fields.team,
        skillLevel: Number(driver.fields.skill_level),
        price: Number(driver.fields.price),
        available: driver.fields.available,
        url: driver.fields.url
      }));
    } catch (error) {
      console.error("Error fetching available drivers:", error);
      return [];
    }
  }

  // 读取车手信息
  async getDriverInfo(driverId: string) {
    try {
      const driver = await this.client.getObject({
        id: driverId,
        options: {
          showContent: true,
        },
      });
      
      if (!driver.data?.content?.fields) return null;
      
      const fields = driver.data.content.fields;
      return {
        name: fields.name,
        team: fields.team,
        skillLevel: fields.skill_level,
        price: fields.price,
        url: fields.url,
      };
    } catch (error) {
      console.error("Error fetching driver info:", error);
      return null;
    }
  }

  // 读取车辆信息
  async getCarInfo(carId: string) {
    try {
      const car = await this.client.getObject({
        id: carId,
        options: {
          showContent: true,
        },
      });
      
      if (!car.data?.content?.fields) return null;
      
      const fields = car.data.content.fields;
      return {
        name: fields.name,
        engineLevel: fields.engine_level,
        price: fields.price,
        url: fields.url,
      };
    } catch (error) {
      console.error("Error fetching car info:", error);
      return null;
    }
  }

  // 获取游戏状态
  async getGameState(gameStateId: string) {
    try {
      const gameState = await this.client.getObject({
        id: gameStateId,
        options: {
          showContent: true,
        },
      });
      
      if (!gameState.data?.content?.fields) return null;
      
      const fields = gameState.data.content.fields;
      return {
        treasury: fields.treasury,
        totalPool: fields.total_pool,
        maintenanceFund: fields.maintenance_fund,
      };
    } catch (error) {
      console.error("Error fetching game state:", error);
      return null;
    }
  }

  // 监听事件
  async subscribeToEvents(callback: (event: any) => void) {
    try {
      await this.client.subscribeEvent({
        filter: {
          Package: DEVNET_F1_CAR_GAME_PACKAGE_ID,
        },
        onMessage: callback,
      });
    } catch (error) {
      console.error("Error subscribing to events:", error);
    }
  }
}