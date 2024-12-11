import { useSuiClientQuery } from "@mysten/dapp-kit";
import { Text } from "@radix-ui/themes";
import { CAR_LIBRARY } from '../constants';
export function ObjectDetails( ) {
  const { data, isPending, error } = useSuiClientQuery("getObject", {
    id: CAR_LIBRARY,
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  if (isPending) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!data.data) return <Text>Not found</Text>;
  console.log(data)
  const objectFields = data.data.content.fields;
  const availableCars = objectFields.available_cars;
  return (
    <div>
    <h3>Object Details</h3>
    <p>ID: {CAR_LIBRARY}</p>
    <p>Object ID: {data.data.objectId}</p>
    <p>Version: {data.data.version}</p>
    
    <h4>Available Cars:</h4>
    {availableCars.map((car, index) => (
      <div key={car.fields.id.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
        <h5>Car #{index + 1}</h5>
        <p>Name: {car.fields.name}</p>
        <p>Engine Level: {car.fields.engine_level}</p>
        <p>Price: {car.fields.price}</p>
        <p>ID: {car.fields.id.id}</p>
      </div>
    ))}
  </div>
  );
}

