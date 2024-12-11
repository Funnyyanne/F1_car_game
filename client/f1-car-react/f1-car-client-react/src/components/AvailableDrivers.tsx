import { useEffect, useState } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { F1GameContract, Driver } from '../F1GameContract';

// 从环境变量或配置文件中获取
import { DRIVER_LIBRARY } from '../constants';

export function AvailableDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const suiClient = useSuiClient();
  const gameContract = new F1GameContract(suiClient);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {drivers.slice(0, -1).map((driver) => (
          <div key={driver.id} className="bg-blue-500">
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
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    onClick={() => {
                      console.log('Buy driver:', driver.id);
                    }}
                  >
                    Buy Driver
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}