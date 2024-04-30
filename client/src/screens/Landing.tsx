import RolesCard from "../component/LandingComponent/RolesCard";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import RestaurantAnimation from '@/assets/RestaurantAnimation.json';
import HamsterAnimation from '@/assets/AnikiHamster.json';

import ManagerMenu from '@/assets/LandingImg/ManagerMenu.png';
import MenuItemModal from '@/assets/LandingImg/MenuItemModal.png';
import OrderHandling from '@/assets/LandingImg/OrderHandling.png';
import TableHandlingBig from '@/assets/LandingImg/TableHandlingBig.png';

import Lottie from 'lottie-react';
import GitHubIcon from '@mui/icons-material/GitHub';

// import icons
import DinnerDiningIcon from '@mui/icons-material/DinnerDining'; // for kitchen staff
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'; // for wait satff
import HomeWorkIcon from '@mui/icons-material/HomeWork'; // for owner
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // for customer

import Navbar from '@/component/LandingComponent/Navbar';

import { Highlight } from '@chakra-ui/react'
import { Heading } from '@chakra-ui/react'
import { useMediaQuery } from '@mui/material';

const Home = () => {
  const navigate = useNavigate();
  const mobileScreen = useMediaQuery('(max-width: 880px)');
  const tabletScreen = useMediaQuery('(max-width: 973px)');

  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <section className="bg-white-200 h-auto w-full flex flex-wrap lg:h-1/2 no-cursor"> 
        {/* Title and description section */}
        <section className="landing-description w-full lg:w-1/2 lg:h-3/5 p-[50px] flex flex-col text-center sm:text-left">
          <Heading lineHeight='tall'>
            <Highlight
              query='restaurants'
              styles={{ px: '2', py: '1', rounded: 'full', bg: 'yellow.200' }}
            >
              Manage your restaurants,
            </Highlight>
            <div>all in one app.</div>
          </Heading>
          <div className="mt-10">
            Introducing our Waiting Management System: revolutionizing the dining experience for both customers and staff. Our system streamlines table reservations, enables real-time order management, and offers menu customization. Customers can easily book tables, kitchen staff can see available tables for efficient order preparation, and wait staff can manage orders seamlessly. With menu control in the hands of managers, our system minimizes errors and ensures a smooth dining experience for all. Welcome to the future of restaurants.
          </div>
          <section className="flex gap-10 justify-center sm:justify-start sm:text-left w-full mt-10">
            <Button className="flex bg-red-500 hover:bg-red-500" onClick={() => navigate('/signin')}>Sign In</Button>
            <Button className="flex bg-blue-500" onClick={() => navigate('/signup')}>Register</Button>
          </section>
        </section>
        {/* Illustration section */}
        <section className="landing-description w-full lg:w-1/2 h-[50%] sm:h-3/5 flex lg:items-center sm:my-auto bg-white justify-center">
					<Lottie className="my-auto" animationData={RestaurantAnimation} loop={true} />
        </section>
      </section>
			{/* section 2: user type cards */}
      <section className="bg-gray-200 h-auto w-screen no-cursor overflow-x-hidden">
				<div className="py-10 roles-landing flex flex-wrap justify-center px-2 gap-10 place-items-center h-auto">
          <RolesCard 
            icon={HomeWorkIcon}
            title="Restaurant Owner / Manager" 
            description="The person in authority of the restaurant. You create kitchen and wait staff accounts. You edit the menu."
          />

					<RolesCard 
						icon={DirectionsRunIcon} 
						title="Kitchen Staff" 
						description="The staff in charge of cooking. You receive orders from the customer and mark those orders as done for the wait staff to serve out. "
					/>

					<RolesCard 
						icon={DinnerDiningIcon}
						title="Wait Staff" 
						description="The staff in charge of handing orders out to customers. You also handle customers who need assistance. "
					/>
					<RolesCard
						icon={FavoriteBorderIcon}
						title="Customer" 
						description="Your the customer, you order food from a restaurant that uses our service WMS. " 
					/>
				</div>
      </section>
			{/* section 3: features */}
      <section className="overflow-x-hidden">
        <section className={`${mobileScreen ? 'flex flex-col' : 'flex'} `}>
          <img className={`${mobileScreen ? 'w-full' : 'w-1/2'}`} src={ManagerMenu} />
          <section className={`${mobileScreen ? 'w-full px-12  text-center' : 'w-1/2 grid place-items-center p-5 text-[20px]'} ${tabletScreen && 'text-[16px]'}`}>
            Explore Our Menu: Dive into our visually appealing menu page, where customers can effortlessly browse through a comprehensive list of dishes, complete with enticing images and detailed descriptions. Designed for ease of navigation, this feature enhances the dining experience by allowing patrons to explore culinary options and specials with just a few clicks.
          </section>
        </section>
        <section className={`${mobileScreen ? 'flex flex-col-reverse' : 'flex'} `}>
          <section className={`${mobileScreen ? 'w-full px-12 text-center' : 'w-1/2 grid place-items-center p-5 text-[20px]'} ${tabletScreen && 'text-[16px]'}`}>
            Detailed Dish Insights: Get up close with our dishes through the detailed menu item modal. Each dish comes alive with high-resolution images, full ingredient lists, and customizable options. Optimized for both desktop and mobile, this feature ensures a seamless selection process, whether you are ordering from home or browsing on the go.
          </section>
          <img className={`${mobileScreen ? 'w-full' : 'w-1/2'}`} src={MenuItemModal} />
        </section>
        <section className={`${mobileScreen ? 'flex flex-col' : 'flex'} `}>
          <img className={`${mobileScreen ? 'w-full' : 'w-1/2'}`} src={TableHandlingBig} />
          <section className={`${mobileScreen ? 'w-full px-12  text-center' : 'w-1/2 grid place-items-center p-5 text-[20px]'} ${tabletScreen && 'text-[16px]'}`}>
            Waitstaff Order and Table Tracker: Empower your waitstaff with an interactive overview of all tables and their current order statuses. This feature provides detailed insights into each table orders, special requests, and dining progress, helping staff coordinate better and deliver prompt and personalized service
          </section>
        </section>
        <section className={`${mobileScreen ? 'flex flex-col-reverse' : 'flex'} mb-10`}>
          <section className={`${mobileScreen ? 'w-full px-12  text-center' : 'w-1/2 grid place-items-center p-5 text-[20px]'} ${tabletScreen && 'text-[16px]'}`}>
            Kitchen Order Management: Streamline your kitchen operations with our dedicated order management page. Kitchen staff can view real-time orders, track cooking progress, and manage dish preparation efficiently. This tool is designed to keep your kitchen running smoothly, reducing wait times and increasing customer satisfaction.
          </section>
          <img className={`${mobileScreen ? 'w-full' : 'w-1/2'}`} src={OrderHandling} />
        </section>
      </section>
			
			{/* footer */}
			<section className="bg-gray-100 no-cursor h-[300px] w-full flex justify-center text-center align-center ">
				<div className="w-1/3 my-auto">
					<a href="https://github.com/unsw-cse-comp99-3900-24t1/capstone-project-3900w18acodingcadets" target="_blank" rel="noopener noreferrer"><GitHubIcon style={{ fontSize: '100px' }}/></a></div>
				<a className="w-1/3 my-auto" href='https://www.instagram.com/alexander_effendy/?hl=en' target="_blank" rel="noopener noreferrer">
					<Lottie className="h-[180px]" animationData={HamsterAnimation} loop={true} />
				</a>
			</section>
    </div>
  );
}

export default Home;

