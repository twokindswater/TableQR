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

  // 드래그 앤 드롭을 위한 센서 설정
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px 이상 움직여야 드래그 시작
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms 이상 터치해야 드래그 시작
        tolerance: 5, // 5px 이상 움직여야 드래그 시작
      },
    })
  );

  // 순서 변경 처리
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
      
      // 순서 업데이트
      const updates = newCategories.map((category, index) => ({
        category_id: category.category_id,
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
        title: '성공',
        description: '카테고리 순서가 변경되었습니다.',
      });
    } catch (error) {
      console.error('카테고리 순서 변경 실패:', error);
      toast({
        title: '오류',
        description: '카테고리 순서 변경에 실패했습니다.',
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
        title: '성공',
        description: '새로운 카테고리가 추가되었습니다.',
      });
    } catch (error) {
      console.error('카테고리 추가 실패:', error);
      toast({
        title: '오류',
        description: '카테고리 추가에 실패했습니다.',
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
        title: '성공',
        description: '카테고리가 수정되었습니다.',
      });
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
      toast({
        title: '오류',
        description: '카테고리 수정에 실패했습니다.',
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
        title: '성공',
        description: '카테고리가 삭제되었습니다.',
      });
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      toast({
        title: '오류',
        description: '카테고리 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 카테고리 목록 */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map(cat => cat.category_id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {categories.map((category) => {
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
                  key={category.category_id}
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
                        <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          정말로 이 카테고리를 삭제하시겠습니까?
                          이 작업은 되돌릴 수 없으며, 카테고리에 속한 모든 메뉴가 미분류 상태가 됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category.category_id)}
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* 카테고리 추가 버튼 */}
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
              '+ 카테고리 추가'
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 카테고리 추가</DialogTitle>
            <p className="text-sm text-gray-500">새로운 카테고리를 추가하세요.</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                카테고리명
              </label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="예: 커피, 디저트"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                설명
              </label>
              <Textarea
                id="description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
                placeholder="카테고리에 대한 설명을 입력하세요"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddCategory} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '추가'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 카테고리 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 수정</DialogTitle>
            <p className="text-sm text-gray-500">카테고리 정보를 수정하세요.</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                카테고리명
              </label>
              <Input
                id="edit-name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="예: 커피, 디저트"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                설명
              </label>
              <Textarea
                id="edit-description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
                placeholder="카테고리에 대한 설명을 입력하세요"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEditCategory} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '수정'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
