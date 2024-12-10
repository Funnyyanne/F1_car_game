import { useEffect, useState } from "react";
import { ConnectButton ,useCurrentAccount} from "@mysten/dapp-kit";
import { Box, Button, Container, Flex, Heading, Text } from "@radix-ui/themes";
import "../styles/HeroSection.css";
import DriverGallery from "./DriverGalley";
export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
	const currentAccount = useCurrentAccount();
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
     <Box className={`hero-section ${isLoaded ? 'fade-in' : ''}`}>
      {/* 背景效果 */}
      <Box className="background-effects">
        <Box className="background-gradient" />
        <Box className="background-orb orb-1" />
        <Box className="background-orb orb-2" />
      </Box>

      {/* 主要内容 */}
      <Container size="4" pt="9">
        <Flex direction="column" align="center" gap="6">
          <Box className={`content-wrapper ${isLoaded ? 'visible' : ''}`}>
            <Heading size="9" mb="4" className="title-gradient">
              F1 梦想赛车
            </Heading>
            
            <Text size="5" color="gray" mb="6" style={{ maxWidth: '36rem', margin: '0 auto' }}>
              组建你的梦想车队，在赛道上争夺荣耀
            </Text>

            <Box mb="6">
              <ConnectButton />
            </Box>

            <Button 
              size="4"
              className="cta-button"
              style={{
                background: 'var(--accent-9)',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              开始购买选手
            </Button>
          </Box>

          {/* 统计数据 */}
          <Flex gap="8" wrap="wrap" justify="center" mt="9">
            {[
              { label: "注册玩家", value: "10,000+" },
              { label: "可选选手", value: "50+" },
              { label: "赛车配件", value: "200+" },
              { label: "比赛奖池", value: "1000 SUI" }
            ].map((stat, index) => (
              <Box 
                key={index} 
                className="stat-item"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <Text size="8" weight="bold" mb="2">
                  {stat.value}
                </Text>
                <Text size="3" color="gray">
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Flex>

          {/* 滚动提示 */}
          <Box className="scroll-indicator">
            <Text size="2" color="gray" mb="2">
              向下滚动探索更多
            </Text>
            <Box className="scroll-arrow" />
          </Box>
        </Flex>
      </Container>
    </Box>
    <DriverGallery isConnected ={isLoaded} currentAccount={currentAccount}/>
    </>
   
    
  );
}