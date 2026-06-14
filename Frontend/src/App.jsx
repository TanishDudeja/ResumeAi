import { RouterProvider } from "react-router"
import {router} from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import ThemeToggle from "./components/ThemeToggle.jsx"

function App() {
  return (
   <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={router} />
        <ThemeToggle />
      </InterviewProvider>
   </AuthProvider>
  )
}

export default App
