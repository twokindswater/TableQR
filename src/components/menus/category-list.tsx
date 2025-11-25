'use client';

import { useState } from 'react';
import { Tables } from '@/types/database.generated';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2, GripVertical, Pencil, Trash } from 'lucide-react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Category = Tables<'categories'>;

interface CategoryListProps {
  storeId: number;
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

export function CategoryList({ storeId, categories, onCategoriesChange }: CategoryListProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  // Sensor configuration for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // Must move 8px to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Must touch for 200ms to start drag
        tolerance: 5, // Must move 5px to start drag
      },
    })
  );

  // Handle order change
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag end:', { active: active.id, over: over?.id });
    
    if (!over || active.id === over.id) {
      console.log('Drag cancelled or same position');
      return;
    }

    const oldIndex = categories.findIndex((cat) => cat.category_id === active.id);
    const newIndex = categories.findIndex((cat) => cat.category_id === over.id);
    
    console.log('Indexes:', { oldIndex, newIndex });
    
    if (oldIndex === -1 || newIndex === -1) {
      console.log('Invalid indexes');
      return;
    }

    try {
      setLoading(true);
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      
      // Update order - use full object but only change display_order
      const updates = newCategories.map((category, index) => ({
        ...category,
        display_order: index,
      }));

      console.log('Updating categories:', updates);

      const { data, error } = await supabase
        .from('categories')
        .upsert(updates, { onConflict: 'category_id' })
        .select();

      console.log('Supabase response:', { data, error });

      if (error) throw error;

      onCategoriesChange(newCategories);
      toast({
        title: 'Success',
        description: 'Category order has been changed.',
      });
    } catch (error) {
      console.error('Failed to change category order:', error);
      toast({
        title: 'Error',
        description: 'Failed to change category order.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .insert({
          store_id: storeId,
          name: newCategory.name,
          description: newCategory.description,
          display_order: categories.length,
        })
        .select()
        .single();

      if (error) throw error;

      onCategoriesChange([...categories, data]);
      setNewCategory({ name: '', description: '' });
      setIsAddDialogOpen(false);
      toast({
        title: 'Success',
        description: 'New category has been added.',
      });
    } catch (error) {
      console.error('Failed to add category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: newCategory.name,
          description: newCategory.description,
        })
        .eq('category_id', selectedCategory.category_id)
        .select()
        .single();

      if (error) throw error;

      onCategoriesChange(
        categories.map((cat) =>
          cat.category_id === selectedCategory.category_id ? data : cat
        )
      );
      setNewCategory({ name: '', description: '' });
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Category has been updated.',
      });
    } catch (error) {
      console.error('Failed to update category:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('category_id', categoryId);

      if (error) throw error;

      onCategoriesChange(
        categories.filter((cat) => cat.category_id !== categoryId)
      );
      toast({
        title: 'Success',
        description: 'Category has been deleted.',
      });
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Category item component
  const CategoryItem = ({ category }: { category: Category }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category.category_id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div 
        ref={setNodeRef} 
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group cursor-move"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
        <span className="flex-1">{category.name}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCategory(category);
            setNewCategory({
              name: category.name,
              description: category.description || '',
            });
            setIsEditDialogOpen(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this category?
                This action cannot be undone, and all menus in this category will become uncategorized.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteCategory(category.category_id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Category list */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map(cat => cat.category_id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {categories.map((category) => (
              <CategoryItem key={category.category_id} category={category} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add category button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              '+ Add Category'
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <p className="text-sm text-gray-500">Add a new category.</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="e.g., Coffee, Desserts"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
                placeholder="Enter a description for the category"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Add'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit category dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <p className="text-sm text-gray-500">Update category information.</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="edit-name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="e.g., Coffee, Desserts"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="edit-description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
                placeholder="Enter a description for the category"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Update'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
