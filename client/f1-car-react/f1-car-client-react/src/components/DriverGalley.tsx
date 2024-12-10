import { useState, useEffect } from 'react';
const driverImages = [
    '/images/driver1.jpg',
    '/images/driver2.jpg',
    '/images/driver3.jpg',
    '/images/driver4.jpg',
    '/images/driver5.jpg'
  ];

  const equipmentImages = [
    '/images/red_sheep.jpg',
    '/images/mclaren_f1.jpg',
    '/images/busylaren.jpg'
  ];
interface DriverGalleryProps {
  isConnected?: boolean;
  currentAccount?: string;
}

const DriverGallery: React.FC<DriverGalleryProps> = ({ isConnected, currentAccount }) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [driverScrollPosition, setDriverScrollPosition] = useState(0);
  
    useEffect(() => {
        const interval = setInterval(() => {
          // 设备滚动
          setScrollPosition((prev) => {
            const step = 0.1; // 减小步长使滚动更平滑
            const containerWidth = window.innerWidth;
            const contentWidth = equipmentImages.length * (300 + 16); // 卡片宽度 + 间距
            const maxScroll = Math.max(0, ((contentWidth - containerWidth) / containerWidth) * 100);
            return prev >= maxScroll ? 0 : prev + step;
          });
    
          // 赛车手滚动
          setDriverScrollPosition((prev) => {
            const step = 0.1; // 减小步长使滚动更平滑
            const containerWidth = window.innerWidth;
            const contentWidth = driverImages.length * (300 + 16); // 卡片宽度 + 间距
            const maxScroll = Math.max(0, ((contentWidth - containerWidth) / containerWidth) * 100);
            return prev >= maxScroll ? 0 : prev + step;
          });
        }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      <div className="flex justify-center w-full mb-8">
      {isConnected && currentAccount ? (
        <button 
          onClick={() => window.location.href = '/buy'} 
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-full animate-pulse"
        >
          立即购买选手
        </button>
      ) : (
        <div className="text-yellow-300">请先连接钱包以购买选手</div>
      )}
      </div>

      <div className="w-full">
        <h2 className="text-2xl font-semibold mb-4">赛车手展示</h2>
        <div className="relative overflow-hidden">
          <div 
            className="flex space-x-4 transition-transform duration-500 ease-in-out"
            style={{ 
                transform: `translateX(-${driverScrollPosition}%)`,
                width: `${driverImages.length * 316}px`, // 300px + 16px margin
                minWidth: '100%',  // 确保至少填满容器宽度
                display: 'flex',
                flexWrap: 'nowrap' // 确保不换行
            }}
          >
            {driverImages.map((image, index) => (
              <div 
                key={index} 
                className="flex-none w-[300px] bg-gray-800 rounded-lg relative group cursor-pointer"
              >
                <div className="relative h-[250px]">
                  <img 
                    src={image}
                    alt={`赛车手视角 ${index + 1}`}
                    className="rounded-lg transition-transform group-hover:scale-105 object-cover w-full h-full"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-3 rounded-b-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">赛车手 {index + 1}</h3>
                      <p className="text-sm text-gray-200">价格: {100 * (index + 1)} SUI</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 w-full">
        <h2 className="text-2xl font-semibold mb-4">赛车设备</h2>
        <div className="relative overflow-hidden">
          <div 
            className="flex space-x-4 transition-transform duration-500 ease-linear"
            style={{ 
              transform: `translateX(-${scrollPosition}%)`,
              width: `${equipmentImages.length * 300}px`,
              minWidth: '100%',  // 确保至少填满容器宽度
                display: 'flex',
                flexWrap: 'nowrap' // 确保不换行
              
            }}
          >
            {equipmentImages.map((image, index) => (
              <div 
                key={index} 
                className="flex-none w-[300px] bg-gray-800 rounded-lg p-4"
              >
                <div className="relative h-[250px]">
                  <img 
                    src={image} 
                    alt={`设备 ${index + 1}`} 
                    className="object-cover w-full h-full rounded-lg"
                  />
                </div>
                <div className="mt-2">
                  <h3 className="text-lg font-semibold">设备 {index + 1}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverGallery;