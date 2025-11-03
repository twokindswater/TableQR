'use client';

import { useState, useMemo, useCallback } from 'react';
import { Tables } from '@/types/database.generated';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  uploadMenuImage,
  deleteMenuImage,
  validateImageFile,
  getMenuImageVariant,
} from '@/lib/supabase-storage';
import { Loader2, GripVertical, Pencil, Trash, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './sortable-item';
import { ImageCropDialog } from '@/components/stores/image-crop-dialog';

type Menu = Tables<'menus'>;
type Category = Tables<'categories'>;

interface MenuListProps {
  storeId: number;
  menus: Menu[];
  categories: Category[];
  onMenusChange: (menus: Menu[]) => void;
}

export function MenuList({ storeId, menus, categories, onMenusChange }: MenuListProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newMenu, setNewMenu] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
  });
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropTarget, setCropTarget] = useState<'new' | 'edit'>('new');

  // 드래그 앤 드롭을 위한 센서 설정
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // 10px 이상 움직여야 드래그 시작
        delay: 250, // 250ms 이상 눌러야 드래그 시작
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms 이상 터치해야 드래그 시작
        tolerance: 10, // 10px 이상 움직여야 드래그 시작
      },
    })
  );

  // 순서 변경 처리
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = menus.findIndex((menu) => menu.menu_id === active.id);
    const newIndex = menus.findIndex((menu) => menu.menu_id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    try {
      setLoading(true);
      const newMenus = arrayMove(menus, oldIndex, newIndex);
      
      // 순서 업데이트
      const updates = newMenus.map((menu, index) => ({
        menu_id: menu.menu_id,
        display_order: index,
      }));

      const { error } = await supabase
        .from('menus')
        .upsert(updates, { onConflict: 'menu_id' });

      if (error) throw error;

      onMenusChange(newMenus);
      toast({
        title: '성공',
        description: '메뉴 순서가 변경되었습니다.',
      });
    } catch (error) {
      console.error('메뉴 순서 변경 실패:', error);
      toast({
        title: '오류',
        description: '메뉴 순서 변경에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenu = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menus')
        .insert({
          store_id: storeId,
          name: newMenu.name,
          description: newMenu.description,
          price: parseInt(newMenu.price),
          category_id: newMenu.category_id ? parseInt(newMenu.category_id) : null,
          image_url: newMenu.image_url,
          display_order: menus.length,
        })
        .select()
        .single();

      if (error) throw error;

      onMenusChange([...menus, data]);
      setNewMenu({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
      });
      setIsAddDialogOpen(false);
      toast({
        title: '성공',
        description: '새로운 메뉴가 추가되었습니다.',
      });
    } catch (error) {
      console.error('메뉴 추가 실패:', error);
      toast({
        title: '오류',
        description: '메뉴 추가에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditMenu = async () => {
    if (!selectedMenu) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menus')
        .update({
          name: newMenu.name,
          description: newMenu.description,
          price: parseInt(newMenu.price),
          category_id: newMenu.category_id ? parseInt(newMenu.category_id) : null,
          image_url: newMenu.image_url,
        })
        .eq('menu_id', selectedMenu.menu_id)
        .select()
        .single();

      if (error) throw error;

      onMenusChange(
        menus.map((menu) =>
          menu.menu_id === selectedMenu.menu_id ? data : menu
        )
      );
      setNewMenu({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
      });
      setIsEditDialogOpen(false);
      toast({
        title: '성공',
        description: '메뉴가 수정되었습니다.',
      });
    } catch (error) {
      console.error('메뉴 수정 실패:', error);
      toast({
        title: '오류',
        description: '메뉴 수정에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenu = async (menuId: number) => {
    try {
      setLoading(true);
      const menuToDelete = menus.find((menu) => menu.menu_id === menuId);
      
      // 메뉴 삭제
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('menu_id', menuId);

      if (error) throw error;

      // 이미지가 있다면 삭제
      if (menuToDelete?.image_url) {
        await deleteMenuImage(menuToDelete.image_url);
      }

      onMenusChange(menus.filter((menu) => menu.menu_id !== menuId));
      toast({
        title: '성공',
        description: '메뉴가 삭제되었습니다.',
      });
    } catch (error) {
      console.error('메뉴 삭제 실패:', error);
      toast({
        title: '오류',
        description: '메뉴 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast({
          title: '오류',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result as string);
        setCropTarget(target);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
      // 파일 입력 초기화
      e.target.value = '';
    }
  }, [toast]);

  const handleCropComplete = useCallback(async (croppedBlob: Blob) => {
    try {
      setLoading(true);

      // Blob을 File로 변환
      const fileName = `menu-${Date.now()}.jpg`;
      const file = new File([croppedBlob], fileName, { type: 'image/jpeg' });

      const existingUrl =
        cropTarget === 'new'
          ? newMenu.image_url || null
          : selectedMenu?.image_url || null;

      const { heroUrl } = await uploadMenuImage(storeId, file, existingUrl);

      if (cropTarget === 'new') {
        setNewMenu((prev) => ({ ...prev, image_url: heroUrl }));
      } else {
        setNewMenu((prev) => ({ ...prev, image_url: heroUrl }));
        setSelectedMenu((prev) =>
          prev ? { ...prev, image_url: heroUrl } : prev
        );
      }

      toast({
        title: '업로드 성공',
        description: '이미지가 성공적으로 업로드되었습니다.',
      });
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast({
        title: '오류',
        description: '이미지 업로드에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, cropTarget, newMenu.image_url, selectedMenu, toast]);

  const handleRemoveImage = useCallback(
    async (target: 'new' | 'edit') => {
      const targetUrl =
        target === 'new' ? newMenu.image_url || null : selectedMenu?.image_url || null;

      if (!targetUrl) {
        setNewMenu((prev) => ({ ...prev, image_url: '' }));
        if (target === 'edit') {
          setSelectedMenu((prev) =>
            prev ? { ...prev, image_url: '' } : prev
          );
        }
        return;
      }

      try {
        setLoading(true);
        await deleteMenuImage(targetUrl);
        toast({
          title: '삭제 완료',
          description: '이미지가 삭제되었습니다.',
        });
      } catch (error) {
        console.error('이미지 삭제 실패:', error);
        toast({
          title: '오류',
          description: '이미지 삭제에 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setNewMenu((prev) => ({ ...prev, image_url: '' }));
        if (target === 'edit') {
          setSelectedMenu((prev) =>
            prev ? { ...prev, image_url: '' } : prev
          );
        }
      }
    },
    [newMenu.image_url, selectedMenu, toast]
  );

  const MenuForm = useMemo(() => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          메뉴명 *
        </label>
        <Input
          id="name"
          value={newMenu.name}
          onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
          placeholder="예: 아메리카노"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          카테고리
        </label>
        <Select
          value={newMenu.category_id}
          onValueChange={(value) =>
            setNewMenu({ ...newMenu, category_id: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem
                key={category.category_id}
                value={category.category_id.toString()}
              >
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="price" className="text-sm font-medium">
          가격 *
        </label>
        <Input
          id="price"
          type="number"
          value={newMenu.price}
          onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
          placeholder="0"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          설명
        </label>
        <Textarea
          id="description"
          value={newMenu.description}
          onChange={(e) =>
            setNewMenu({ ...newMenu, description: e.target.value })
          }
          placeholder="메뉴에 대한 설명을 입력하세요"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">이미지</label>
        <div className="mt-2">
          {newMenu.image_url ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={
                  getMenuImageVariant(newMenu.image_url, 'detail') ??
                  newMenu.image_url
                }
                alt={newMenu.name || '메뉴 이미지'}
                fill
                className="object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  void handleRemoveImage(selectedMenu ? 'edit' : 'new');
                }}
                disabled={loading}
              >
                삭제
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full aspect-video bg-gray-100 rounded-lg">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e, 'new')}
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
              >
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  클릭하여 이미지 업로드
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  ), [newMenu, categories, handleImageSelect, handleRemoveImage, selectedMenu, loading]);

  return (
    <div className="space-y-4">
      {/* 메뉴 목록 - 드래그 앤 드롭 컨텍스트를 여기에만 적용 */}
      <div>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={menus.map(menu => menu.menu_id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menus.map((menu) => (
                <SortableItem key={menu.menu_id} id={menu.menu_id}>
                <div className="relative group border rounded-lg overflow-hidden hover:border-gray-400 bg-white shadow-sm">
                  <div className="absolute top-2 left-2 z-10">
                    <GripVertical className="w-5 h-5 text-white drop-shadow cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {/* 이미지 영역 */}
                  <div className="aspect-video bg-gray-100 relative">
                    {menu.image_url ? (
                      <Image
                        src={
                          getMenuImageVariant(menu.image_url, 'card') ??
                          menu.image_url
                        }
                        alt={menu.name || ''}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* 가격 오버레이 */}
                    {menu.price && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                        {menu.price.toLocaleString()}원
                      </div>
                    )}
                  </div>
                  
                  {/* 메뉴 정보 영역 */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                        {menu.name || '이름 없음'}
                      </h3>
                      {menu.category_id && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary shrink-0">
                          {categories.find(cat => cat.category_id === menu.category_id)?.name || '미분류'}
                        </span>
                      )}
                    </div>
                    {menu.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {menu.description}
                      </p>
                    )}
                  </div>
                  
                  {/* 편집 버튼들 */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={() => {
                        setSelectedMenu(menu);
                        setNewMenu({
                          name: menu.name || '',
                          description: menu.description || '',
                          price: menu.price?.toString() || '',
                          category_id: menu.category_id?.toString() || '',
                          image_url: menu.image_url || '',
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="h-8 w-8 bg-red-500/90 hover:bg-red-500"
                        >
                          <Trash className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>메뉴 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            정말로 이 메뉴를 삭제하시겠습니까?
                            이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMenu(menu.menu_id)}
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* 메뉴 추가 버튼 - 드래그 앤 드롭 컨텍스트 외부 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              '+ 메뉴 추가'
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 메뉴 추가</DialogTitle>
            <p className="text-sm text-gray-500">새로운 메뉴를 추가하세요.</p>
          </DialogHeader>
          {MenuForm}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddMenu} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '추가'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 메뉴 수정 다이얼로그 - 드래그 앤 드롭 컨텍스트 외부 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>메뉴 수정</DialogTitle>
            <p className="text-sm text-gray-500">메뉴 정보를 수정하세요.</p>
          </DialogHeader>
          {MenuForm}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEditMenu} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '수정'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 이미지 크롭 다이얼로그 */}
      <ImageCropDialog
        open={cropDialogOpen}
        imageSrc={cropImageSrc}
        onClose={() => setCropDialogOpen(false)}
        onCropComplete={handleCropComplete}
        aspectRatio={16 / 9}
        cropShape="rect"
      />
    </div>
  );
}
