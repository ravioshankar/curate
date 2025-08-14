import { Provider } from 'react-redux';
import { store } from '../../src/store/store';
import { InventoryScreen } from '../../src/screens/InventoryScreen';

export default function InventoryTab() {
  return (
    <Provider store={store}>
      <InventoryScreen />
    </Provider>
  );
}