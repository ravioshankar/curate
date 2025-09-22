import { AppDispatch } from '../store/store';
import { addItem, addCollectionItem, updateCollectionItem } from '../store/collectionStore';
import { CollectionItem } from '../types/collection';

export const addItemToCollection = (dispatch: AppDispatch) => {
  return (item: CollectionItem) => {
    console.log('Adding item to collection:', item);
    
    // Add to UI immediately for instant feedback
    dispatch(addItem(item));
    
    // Save to database in background
    dispatch(addCollectionItem(item)).catch(error => {
      console.error('Background save failed:', error);
    });
  };
};

export const saveItemToCollection = (dispatch: AppDispatch) => {
  return (item: CollectionItem, isEdit: boolean) => {
    console.log(`${isEdit ? 'Updating' : 'Adding'} item:`, item);
    
    if (isEdit) {
      // Update existing item
      dispatch(updateCollectionItem(item)).catch(error => {
        console.error('Update failed:', error);
      });
    } else {
      // Add new item - immediate UI update + background save
      dispatch(addItem(item));
      dispatch(addCollectionItem(item)).catch(error => {
        console.error('Background save failed:', error);
      });
    }
  };
};