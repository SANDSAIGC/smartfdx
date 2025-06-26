"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Camera, Palette, User } from "lucide-react";

interface AvatarSelectorProps {
  currentAvatar?: string;
  userName: string;
  onAvatarSelect: (avatarData: AvatarData) => void;
  children: React.ReactNode;
}

interface AvatarData {
  type: 'preset' | 'upload' | 'generated';
  value: string;
  color?: string;
}

// 预设头像选项
const PRESET_AVATARS = [
  { id: 'avatar1', url: '/avatars/avatar1.svg', name: '默认头像1' },
  { id: 'avatar2', url: '/avatars/avatar2.svg', name: '默认头像2' },
  { id: 'avatar3', url: '/avatars/avatar3.svg', name: '默认头像3' },
  { id: 'avatar4', url: '/avatars/avatar4.svg', name: '默认头像4' },
  { id: 'avatar5', url: '/avatars/avatar5.svg', name: '默认头像5' },
  { id: 'avatar6', url: '/avatars/avatar6.svg', name: '默认头像6' },
];

// 随机生成的头像颜色方案
const AVATAR_COLORS = [
  { bg: 'bg-red-500', text: 'text-white', name: '红色' },
  { bg: 'bg-blue-500', text: 'text-white', name: '蓝色' },
  { bg: 'bg-green-500', text: 'text-white', name: '绿色' },
  { bg: 'bg-purple-500', text: 'text-white', name: '紫色' },
  { bg: 'bg-orange-500', text: 'text-white', name: '橙色' },
  { bg: 'bg-pink-500', text: 'text-white', name: '粉色' },
  { bg: 'bg-indigo-500', text: 'text-white', name: '靛蓝' },
  { bg: 'bg-teal-500', text: 'text-white', name: '青色' },
  { bg: 'bg-yellow-500', text: 'text-black', name: '黄色' },
  { bg: 'bg-gray-500', text: 'text-white', name: '灰色' },
];

export function AvatarSelector({ currentAvatar, userName, onAvatarSelect, children }: AvatarSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'preset' | 'generated' | 'upload'>('preset');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');

  const handlePresetSelect = (avatar: typeof PRESET_AVATARS[0]) => {
    onAvatarSelect({
      type: 'preset',
      value: avatar.url,
    });
    setOpen(false);
  };

  const handleColorSelect = (color: typeof AVATAR_COLORS[0]) => {
    onAvatarSelect({
      type: 'generated',
      value: userName.charAt(0) || 'U',
      color: color.bg,
    });
    setOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadConfirm = () => {
    if (uploadPreview) {
      onAvatarSelect({
        type: 'upload',
        value: uploadPreview,
      });
      setOpen(false);
      setUploadedFile(null);
      setUploadPreview('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            选择头像
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* 选项卡 */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedTab === 'preset' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('preset')}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-1" />
              预设头像
            </Button>
            <Button
              variant={selectedTab === 'generated' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('generated')}
              className="flex-1"
            >
              <Palette className="h-4 w-4 mr-1" />
              字母头像
            </Button>
            <Button
              variant={selectedTab === 'upload' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('upload')}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-1" />
              上传照片
            </Button>
          </div>

          <Separator className="mb-4" />

          {/* 预设头像选项 */}
          {selectedTab === 'preset' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {PRESET_AVATARS.map((avatar) => (
                  <div
                    key={avatar.id}
                    className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handlePresetSelect(avatar)}
                  >
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={avatar.url} alt={avatar.name} />
                      <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Badge variant="outline" className="text-xs">
                      {avatar.name}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 生成的字母头像选项 */}
          {selectedTab === 'generated' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                选择颜色方案生成字母头像
              </p>
              <div className="grid grid-cols-5 gap-3">
                {AVATAR_COLORS.map((color, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleColorSelect(color)}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={`${color.bg} ${color.text} text-lg font-semibold`}>
                        {userName.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant="outline" className="text-xs">
                      {color.name}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 上传照片选项 */}
          {selectedTab === 'upload' && (
            <div className="space-y-4">
              <div className="text-center">
                {uploadPreview ? (
                  <div className="space-y-4">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage src={uploadPreview} alt="上传预览" />
                      <AvatarFallback>预览</AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Button onClick={handleUploadConfirm} className="flex-1">
                        确认使用
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadPreview('');
                          setUploadedFile(null);
                        }}
                        className="flex-1"
                      >
                        重新选择
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      点击选择或拖拽图片文件
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload">
                      <Button variant="outline" className="cursor-pointer">
                        选择文件
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
