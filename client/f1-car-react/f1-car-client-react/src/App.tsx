import { Box, Flex, Heading } from "@radix-ui/themes";
import { HeroSection } from "./components/HeroSection";
import { AvailableDrivers } from './components/AvailableDrivers';
// import { ObjectDetails } from './components/Test';
import { AvaliableCars } from './components/AvaliableCars';
function App() {
  return (
    <>
    <Flex
        position="sticky"
        top="0"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          zIndex: 50,
        }}
      >
        <Box>
          <Heading>F1 Dream Team</Heading>
        </Box>
      </Flex> 
      
     <HeroSection />
      
       {/* 其他内容区域 */}
      <div>
       <h1 className="text-3xl font-bold text-center my-8">
        Available F1 Drivers
     </h1>
     <AvailableDrivers />
     <AvaliableCars />
     </div>
     </>
  );
}
export default App