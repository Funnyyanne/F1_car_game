import { useEffect, useState } from 'react';
import { useSuiClient,useSuiClientQuery,useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { F1GameContract, Driver } from '../F1GameContract';
import '../styles/AvailableDrivers.css';
// 从环境变量或配置文件中获取
import { DRIVER_LIBRARY,GAME_STATE} from '../constants';

interface AvailableDriversProps {
  onSelectDriver: (driver: Driver) => void;
  onPurchaseDriver: (driver: Driver) => void;
  selectedDriver: Driver | null;
  disabled: boolean;
}

export function AvailableDrivers({
  onSelectDriver,
  onPurchaseDriver,
  selectedDriver,
  disabled
}: AvailableDriversProps) {

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [digest, setDigest] = useState('');
  const [message, setMessage] = useState('');

  const suiClient = useSuiClient();
  const gameContract = new F1GameContract(suiClient);
  const {mutate :signAndExecuteTransaction} = useSignAndExecuteTransaction();

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const availableDrivers = await gameContract.getAvailableDrivers(DRIVER_LIBRARY);
      setDrivers(availableDrivers);
      console.log(availableDrivers);
    } catch (err) {
      setError('Failed to load drivers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading drivers...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }


  const handleBuyDriver = async (driver: Driver) => {
    try {
      setPurchasing(true);
      setMessage(''); // 重置消息

      // 创建交易
      const tx = await gameContract.buyGameTokens(
        GAME_STATE,
        driver.id,
        driver.price
      );

      // 执行交易
      
      await signAndExecuteTransaction({transaction:tx,chain:'sui:devnet'},
        {onSuccess:(result)=>{
        console.log('executed transaction success',result);
        setDigest(result.digest);
        setMessage('Purchase successful!'); // 设置成功消息

        setSelectedDriverId(driverId);
        alert("Driver purchased successfully!");
    },onError:(error)=>{
        console.log('executed transaction error',error);
        setMessage(error.message);
    }   });
      console.log('Purchase successful:', result);
      
      // 刷新驾驶员列表
      await loadDrivers();      
      // 更新选中的驾驶员
      setSelectedDriver(null);
    } catch (error) {
      console.error('Failed to purchase driver:', error);
      setError('Failed to purchase driver');
    } finally {
      setPurchasing(false);
    }
  };
  // Handle car purchase and race calculation
  const handlePurchaseAndRace = async (carId: string) => {
    if (!selectedDriverId) {
      alert("Please purchase a driver first!");
      return;
    }

    try {
      // First purchase the car (you'll need to implement this)
      // ... purchase logic ...

      // After purchase, calculate race result
      const gameStateId = GAME_STATE; // Get this from your game state
      
      const tx = await gameContract.calculateRaceResult(
        gameStateId,
        carId,
        selectedDriverId
      );

      const response = await signAndExecute({
        transactionBlock: tx,
      });

      console.log("Race calculation response:", response);
      alert("Race calculation completed!");
    } catch (error) {
      console.error("Error in purchase and race:", error);
      alert("Failed to process transaction");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 overflow-hidden">
      {message && (
        <div className={`mb-4 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      <div className="drivers-container">
        
        <div className="drivers-scroll">
          {/* 复制两次驾驶员列表以实现无缝循环 */}
          {[...drivers.slice(0, -1), ...drivers.slice(0, -1)].map((driver, index) => (
            <div 
              key={`${driver.id}-${index}`} 
              className={`driver-card ${selectedDriver?.id === driver.id ? 'selected' : ''}`}
              onClick={() => setSelectedDriver(driver)}
            >
              <div className="w-full max-w-xs bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={`/images/${driver.name}.jpg`}
                  alt={driver.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white">{driver.name}</h3>
                  <p className="text-gray-300">Team: {driver.team}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">Skill Level:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <span
                          key={index}
                          className={`text-lg ${
                            index < driver.skillLevel
                              ? 'text-yellow-500'
                              : 'text-gray-600'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300">Price: {driver.price} SUI</p>
                  {driver.available && (
                    <button
                      className={`w-full mt-4 ${
                        selectedDriver?.id === driver.id 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                      } text-white font-bold py-2 px-4 rounded transition-colors`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyDriver(driver);
                      }}
                      disabled={purchasing}
                    >
                      {purchasing ? 'Processing...' : selectedDriver?.id === driver.id ? 'Selected' : 'Buy Driver'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}