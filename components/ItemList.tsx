import * as React from 'react';
import { Trash2, Edit2 } from 'lucide-react';

interface ItemListProps<T> {
  items: T[];
  renderItem: (item: T) => any;
  onDelete?: (id: string) => void;
  onEdit?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

/**
 * Reusable list component to reduce code duplication across modules
 */
const ItemListComponent = <T extends { id: string }>(
  {
    items,
    renderItem,
    onDelete,
    onEdit,
    emptyMessage = 'No items found',
    className = ''
  }: ItemListProps<T>
) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <div key={item.id} className="group flex items-center justify-between p-4 rounded-lg border border-transparent hover:border-border hover:bg-bg-tertiary transition-all">
          <div className="flex-1">{renderItem(item)}</div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

ItemListComponent.displayName = 'ItemList';

export const ItemList = React.memo(ItemListComponent);
