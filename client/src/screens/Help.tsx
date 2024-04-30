import Navbar from '@/component/LandingComponent/Navbar';
import ScanBarcodeAnimation from '@/assets/ScanBarcodeAnimation.json';
import Lottie from 'lottie-react';

const Home = () => {
  return (
    <>
      <Navbar />
      <section className="grid place-items-center text-6xl h-screen">
        <div className="font-bold">How can I help you sir?</div>
        <Lottie className="my-auto bg-white-200 -mt-32" animationData={ScanBarcodeAnimation} loop={true} />
      </section>
    </>
  );
}

export default Home;