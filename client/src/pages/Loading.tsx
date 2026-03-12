import { Loader2Icon } from "lucide-react"
import { useEffect } from "react"

/**
 * Loading Component
 * 
 * Displays a full screen loading spinner while a process
 * (such as authentication or redirect flow) is happening.
 * 
 * After a short delay, the user is automatically redirected
 * to the homepage. This helps avoid users staying stuck on
 * the loading page if something takes longer than expected.
 */

const Loading = () => {

  /**
   * useEffect runs when the component renders.
   * A timeout is used to redirect the user to the
   * homepage after 6 seconds.
   */
  useEffect(() => {
    setTimeout(() => {
      // Redirect user to the homepage
      window.location.href = '/'
    }, 6000)
  })

  return (
    // Full screen container for the loading state
    <div className="h-screen flex flex-col" >

      {/* Center the loader icon vertically and horizontally */}
      <div className="flex items-center justify-center flex-1">

        {/* Animated spinner icon indicating loading */}
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />

      </div>
    </div>
  )
}

export default Loading