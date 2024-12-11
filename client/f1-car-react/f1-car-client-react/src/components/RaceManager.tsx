import { useSuiClient, useSignAndExecuteTransactionBlock,useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useState } from 'react';
import { F1GameContract, Driver } from '../F1GameContract';
import { GAME_STATE } from '../constants';
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { AvailableDrivers } from './AvailableDrivers';
import { AvaliableCars } from './AvaliableCars';

export function RaceManager() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [raceResult, setRaceResult] = useState<any>(null);

  const suiClient = useSuiClient();
  const gameContract = new F1GameContract(suiClient);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Handle driver purchase
  const handleBuyDriver = async (driver: Driver) => {
    try {
      setLoading(true);
      setMessage('');
      setError(null);

      const tx = await gameContract.buyGameTokens(
        GAME_STATE,
        driver.id,
        driver.price
      );

      await signAndExecute({
        transactionBlock: tx,
      }, {
        onSuccess: (result) => {
          console.log('Driver purchase success:', result);
          setSelectedDriver(driver);
          setMessage('Driver purchased successfully!');
        },
        onError: (error) => {
          console.error('Driver purchase error:', error);
          setError(error.message);
        }
      });

    } catch (error) {
      console.error("Error buying driver:", error);
      setError('Failed to purchase driver');
    } finally {
      setLoading(false);
    }
  };

  // Handle race calculation
  const handleRaceCalculation = async () => {
    if (!selectedDriver || !selectedCarId) {
      setError("Please select both a driver and a car!");
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setError(null);

      const tx = await gameContract.calculateRaceResult(
        GAME_STATE,
        selectedCarId,
        selectedDriver.id
      );

      await signAndExecute({
        transactionBlock: tx,
      }, {
        onSuccess: (result) => {
          console.log('Race calculation success:', result);
          setRaceResult(result);
          setMessage('Race completed successfully!');
        },
        onError: (error) => {
          console.error('Race calculation error:', error);
          setError(error.message);
        }
      });

    } catch (error) {
      console.error("Error in race calculation:", error);
      setError('Failed to process race calculation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="4">
      {/* Status Messages */}
      {(message || error) && (
        <Box className="mb-6 p-4 rounded-lg" style={{
          backgroundColor: error ? 'var(--red-a2)' : 'var(--green-a2)',
        }}>
          <Text>{error || message}</Text>
        </Box>
      )}

      {/* Race Manager Section */}
      <Flex direction="column" gap="6">
        <Box>
          <Heading size="4" mb="4">Select Your Driver</Heading>
          <AvailableDrivers 
            onSelectDriver={(driver) => setSelectedDriver(driver)}
            onPurchaseDriver={handleBuyDriver}
            selectedDriver={selectedDriver}
            disabled={loading}
          />
        </Box>

        <Box>
          <Heading size="4" mb="4">Select Your Car</Heading>
          <AvaliableCars
            onSelectCar={(carId) => setSelectedCarId(carId)}
            selectedCarId={selectedCarId}
            disabled={loading || !selectedDriver}
          />
        </Box>

        {/* Race Control Section */}
        {selectedDriver && selectedCarId && (
          <Box className="p-6 rounded-lg" style={{
            backgroundColor: 'var(--gray-a2)',
          }}>
            <Heading size="3" mb="4">Race Setup</Heading>
            <Flex gap="4" direction="column">
              <Text>Selected Driver: {selectedDriver.name}</Text>
              <Text>Selected Car ID: {selectedCarId.slice(0, 8)}...</Text>
              
              <button
                onClick={handleRaceCalculation}
                disabled={loading}
                className={`
                  py-2 px-4 rounded-lg font-bold text-white
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'}
                  transition-colors
                `}
              >
                {loading ? 'Processing Race...' : 'Start Race'}
              </button>
            </Flex>
          </Box>
        )}

        {/* Race Result Display */}
        {raceResult && (
          <Box className="p-6 rounded-lg bg-blue-50">
            <Heading size="3" mb="4">Race Results</Heading>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(raceResult, null, 2)}
            </pre>
          </Box>
        )}
      </Flex>
    </Container>
  );
}