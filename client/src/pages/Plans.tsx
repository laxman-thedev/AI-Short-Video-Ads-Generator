import Pricing from "../components/Pricing";

/**
 * Plans Page
 * 
 * Displays available pricing plans for users.
 * The page includes the Pricing component and
 * a short description explaining how credits
 * are used within the platform.
 * 
 * Credit usage:
 * - Image generation: 5 credits
 * - Video generation: 10 credits
 */

const Plans = () => {
  return (
    // Page container with responsive padding
    <div className="max-sm:py-10 sm:pt-20" >

      {/* Pricing component displays available subscription plans */}
      <Pricing />

      {/* Explanation text for credit usage in the platform */}
      <p className="text-center text-gray-400 max-w-md text-sm my-14 mx-auto px-12 " >
        Create stunning images for just <span className="text-indigo-400 font-medium" >5 credits</span> 
        {" "}and generate impressive videos for{" "}
        <span className="text-indigo-400 font-medium" >10 credits</span>
      </p>

    </div>
  );
}

export default Plans;