import { useEffect, useState } from 'react';
import { useSuiClient, useSuiClientQuery } from '@mysten/dapp-kit';
import { F1GameContract, Driver } from '../F1GameContract';
import '../styles/AvailableDrivers.css';
import { DRIVER_LIBRARY } from '../constants';

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
    } catch (err) {
      setError('Failed to load drivers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading drivers...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="drivers-container">
      <div className="drivers-scroll" style={{ paddingBottom: '20px' }}>
        {drivers.map((driver) => (
          <div 
            key={driver.id} 
            className={`driver-card ${selectedDriver?.id === driver.id ? 'selected' : ''} ${disabled ? 'opacity-50' : ''}`}
            onClick={() => !disabled && onSelectDriver(driver)}
          >
            <div className="w-full max-w-xs bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
              <img
                src={driver.url || `/images/${driver.name}.jpg`}
                alt={driver.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder.jpg';
                }}
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
                
                <button
                  className={`
                    w-full mt-4 py-2 px-4 rounded transition-colors
                    ${selectedDriver?.id === driver.id 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-blue-600 hover:bg-blue-700'}
                    ${disabled ? 'cursor-not-allowed opacity-50' : ''}
                    text-white font-bold
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) {
                      onPurchaseDriver(driver);
                    }
                  }}
                  disabled={disabled}
                >
                  {selectedDriver?.id === driver.id ? 'Selected' : 'Buy Driver'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}