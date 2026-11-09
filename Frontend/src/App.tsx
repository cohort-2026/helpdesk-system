import './App.css';
import { AuthProvider } from './context/AuthProvider';
import { UsersProvider } from './context/UsersProvider';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <AuthProvider>
      <UsersProvider>
        {/* <Loader/> */}
        <AppRouter />
      </UsersProvider>
    </AuthProvider>
  );
}


export default App;
