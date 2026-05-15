import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store/store'
import { SocketProvider } from './context/SocketContext'
import './index.css'
import App from './App.jsx'
import Loader from './components/common/Loader'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Loader fullScreen />} persistor={persistor}>
        <SocketProvider>
          <App />
        </SocketProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
