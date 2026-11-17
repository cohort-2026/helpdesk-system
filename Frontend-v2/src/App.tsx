import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { UsersProvider } from "./context/UsersContext";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <AuthProvider>
      <UsersProvider>
        <AppRouter />
      </UsersProvider>
    </AuthProvider>
  );
}

export default App;
