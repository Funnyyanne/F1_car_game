import { useSuiClientQuery } from "@mysten/dapp-kit";
import { Text } from "@radix-ui/themes";
import { CAR_LIBRARY } from '../constants';
import { useState, useEffect, useMemo } from 'react';

const carImages = [
  '/images/red_sheep.jpg',
  '/images/mclaren_f1.jpg', 
  '/images/busylaren.jpg',
  '/images/baoma.jpeg', 
  '/images/blue.jpeg',
  '/images/pecel.webp',
  '/images/suopo.jpeg',
  '/images/hans.jpeg',
  '/images/ferrari.jpeg',
];

export function AvaliableCars() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const { data, isPending, error } = useSuiClientQuery("getObject", {
    id: CAR_LIBRARY,
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  // 为每个车辆生成固定的随机图片
  const randomCarImages = useMemo(() => {
    const length = data?.data?.content?.fields?.available_cars?.length || 0;
    return Array(length).fill(0).map(() => {
      const randomIndex = Math.floor(Math.random() * carImages.length);
      return carImages[randomIndex];
    });
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const step = 0.1; // 减小步长使滚动更平滑
        const containerWidth = window.innerWidth;
        const contentWidth = data?.data?.content?.fields?.available_cars?.length * (200 + 20) || 0; // 卡片宽度 + 间距
        const maxScroll = Math.max(0, ((contentWidth - containerWidth) / containerWidth) * 100);
        return prev >= maxScroll ? 0 : prev + step;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [data]);

  if (isPending) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!data.data) return <Text>Not found</Text>;
  console.log(data)
  const objectFields = data.data.content.fields;
  const availableCars = objectFields.available_cars;

  return (
    <div>
      <p>ID: {CAR_LIBRARY}</p>
      <p>Object ID: {data.data.objectId}</p>
      <p>Version: {data.data.version}</p>
    
      <h4>Available Cars:</h4>
      <div style={{ 
        display: 'flex', 
        overflowX: 'hidden',
        padding: '10px',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          transform: `translateX(-${scrollPosition}%)`,
          transition: 'transform 0.05s linear'
        }}>
          {availableCars.map((car, index) => (
            <div key={car.fields.id.id} style={{ 
              border: '1px solid #ccc',
              margin: '0 10px',
              padding: '10px',
              minWidth: '200px',
              flex: '0 0 auto'
            }}>
              <img 
                src={car.fields.url || randomCarImages[index]} 
                alt={car.fields.name}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  marginBottom: '10px',
                  borderRadius: '4px'
                }}
              />
              <h5>Car #{index + 1}</h5>
              <p>Name: {car.fields.name}</p>
              <p>Engine Level: {car.fields.engine_level}</p>
              <p>Price: {car.fields.price}</p>
              <p>ID: {car.fields.id.id.slice(0, 5)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
