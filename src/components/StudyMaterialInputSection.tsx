import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Link2,
  FolderPlus,
  PlusCircle,
  BookOpen,
  Sparkles,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  Tag,
  Filter,
  Layers,
  Upload,
  X,
  Copy,
  Lightbulb,
  GraduationCap,
  RotateCcw,
  Database,
  Save
} from 'lucide-react';
import { StudyMaterialItem, StudyMaterialType } from '../types';
import {
  STUDY_TOPIC_OPTIONS,
  SAMPLE_TEXT_SNIPPETS,
  SAMPLE_IMAGE_PRESETS,
  SAMPLE_URL_PRESETS,
  INITIAL_STUDY_MATERIALS,
  StudyTopicOption
} from '../data/materialsData';
import {
  loadStudyMaterials,
  saveStudyMaterials,
  resetStudyMaterialsToDefault
} from '../utils/storage';

interface StudyMaterialInputSectionProps {
  onNotify?: (message: string) => void;
  materials?: StudyMaterialItem[];
  onUpdateMaterials?: React.Dispatch<React.SetStateAction<StudyMaterialItem[]>>;
  onResetMaterials?: () => void;
  onGenerateSummaryFromMaterials?: (materialsToUse: StudyMaterialItem[]) => void;
}

export const StudyMaterialInputSection: React.FC<StudyMaterialInputSectionProps> = ({
  onNotify,
  materials: propsMaterials,
  onUpdateMaterials,
  onResetMaterials,
  onGenerateSummaryFromMaterials,
}) => {
  // State quản lý danh sách học liệu - khởi tạo từ LocalStorage (hoặc nhận từ props)
  const [internalMaterials, setInternalMaterials] = useState<StudyMaterialItem[]>(loadStudyMaterials);

  const materials = propsMaterials ?? internalMaterials;
  const setMaterials = onUpdateMaterials ?? setInternalMaterials;

  // Tự động đồng bộ với LocalStorage khi materials thay đổi
  useEffect(() => {
    saveStudyMaterials(materials);
  }, [materials]);

  // Active material input type (Text-first default!)
  const [activeInputType, setActiveInputType] = useState<StudyMaterialType>('text');

  // Topic selection state
  const [selectedGrade, setSelectedGrade] = useState<string>('Tất cả');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(STUDY_TOPIC_OPTIONS[0].id);
  const [isCustomTopicMode, setIsCustomTopicMode] = useState<boolean>(false);
  const [customTopicTitle, setCustomTopicTitle] = useState<string>('');

  // Form states - Text
  const [textTitle, setTextTitle] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [textNote, setTextNote] = useState<string>('');

  // Form states - Image
  const [imageTitle, setImageTitle] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageCaption, setImageCaption] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states - URL
  const [urlTitle, setUrlTitle] = useState<string>('');
  const [urlLink, setUrlLink] = useState<string>('');
  const [urlDescription, setUrlDescription] = useState<string>('');

  // Filter in list
  const [listFilterType, setListFilterType] = useState<string>('all');
  const [listFilterTopic, setListFilterTopic] = useState<string>('all');

  // Modal detail state
  const [viewingItem, setViewingItem] = useState<StudyMaterialItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (onNotify) onNotify(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to get active topic title
  const getCurrentTopicTitle = (): string => {
    if (isCustomTopicMode && customTopicTitle.trim()) {
      return customTopicTitle.trim();
    }
    const found = STUDY_TOPIC_OPTIONS.find((t) => t.id === selectedTopicId);
    return found ? found.title : 'Chủ đề ôn tập Hóa học';
  };

  // Handle Text Submission
  const handleAddTextMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) {
      showToast('⚠️ Vui lòng nhập nội dung bài ghi chép trước khi lưu.');
      return;
    }

    const titleToUse = textTitle.trim() || `Ghi chép: ${getCurrentTopicTitle().slice(0, 32)}`;
    const wordCount = textContent.trim().split(/\s+/).length;

    const newItem: StudyMaterialItem = {
      id: `mat-${Date.now()}`,
      type: 'text',
      title: titleToUse,
      subject: 'Hóa học',
      grade: selectedGrade === 'Tất cả' ? 'Hóa học THPT' : selectedGrade,
      topicId: isCustomTopicMode ? 'custom' : selectedTopicId,
      topicTitle: getCurrentTopicTitle(),
      content: textContent.trim(),
      noteOrCaption: textNote.trim() || undefined,
      createdAt: 'Vừa xong',
      wordCount,
      tags: ['Văn bản ghi chép', 'Lý thuyết'],
    };

    setMaterials((prev) => [newItem, ...prev]);
    setTextTitle('');
    setTextContent('');
    setTextNote('');
    showToast(` Đã thêm ghi chép "${titleToUse}" & lưu vào LocalStorage!`);
  };

  // Handle Image File selection
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Vui lòng chọn tệp hình ảnh (PNG, JPG, JPEG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreviewUrl(reader.result);
        if (!imageTitle) {
          setImageTitle(`Ảnh chụp vở ghi: ${file.name.replace(/\.[^/.]+$/, '')}`);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Handle Image Submission
  const handleAddImageMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreviewUrl) {
      showToast('⚠️ Vui lòng tải ảnh lên hoặc chọn một ảnh mẫu.');
      return;
    }

    const titleToUse = imageTitle.trim() || `Ảnh tài liệu: ${getCurrentTopicTitle().slice(0, 32)}`;

    const newItem: StudyMaterialItem = {
      id: `mat-${Date.now()}`,
      type: 'image',
      title: titleToUse,
      subject: 'Hóa học',
      grade: selectedGrade === 'Tất cả' ? 'Hóa học THPT' : selectedGrade,
      topicId: isCustomTopicMode ? 'custom' : selectedTopicId,
      topicTitle: getCurrentTopicTitle(),
      content: imagePreviewUrl,
      noteOrCaption: imageCaption.trim() || 'Ảnh chụp trang vở hoặc tài liệu ôn tập.',
      createdAt: 'Vừa xong',
      tags: ['Ảnh vở ghi', 'Tài liệu trực quan'],
    };

    setMaterials((prev) => [newItem, ...prev]);
    setImageTitle('');
    setImagePreviewUrl('');
    setImageCaption('');
    showToast(` Đã lưu hình ảnh "${titleToUse}" & lưu vào LocalStorage!`);
  };

  // Handle URL Submission
  const handleAddUrlMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlLink.trim()) {
      showToast('⚠️ Vui lòng dán đường dẫn liên kết bài giảng.');
      return;
    }

    // basic URL format check
    let formattedUrl = urlLink.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const titleToUse = urlTitle.trim() || `Bài giảng: ${getCurrentTopicTitle().slice(0, 32)}`;

    const newItem: StudyMaterialItem = {
      id: `mat-${Date.now()}`,
      type: 'url',
      title: titleToUse,
      subject: 'Hóa học',
      grade: selectedGrade === 'Tất cả' ? 'Hóa học THPT' : selectedGrade,
      topicId: isCustomTopicMode ? 'custom' : selectedTopicId,
      topicTitle: getCurrentTopicTitle(),
      content: formattedUrl,
      noteOrCaption: urlDescription.trim() || 'Liên kết học tập trực tuyến.',
      createdAt: 'Vừa xong',
      tags: ['Liên kết bài học', 'Video / Bài đọc'],
    };

    setMaterials((prev) => [newItem, ...prev]);
    setUrlTitle('');
    setUrlLink('');
    setUrlDescription('');
    showToast(` Đã lưu liên kết "${titleToUse}" & lưu vào LocalStorage!`);
  };

  // Quick preset fillers
  const applyTextPreset = (snippet: typeof SAMPLE_TEXT_SNIPPETS[0]) => {
    setTextTitle(snippet.title);
    setTextContent(snippet.content);
    setSelectedTopicId(snippet.topicId);
    setIsCustomTopicMode(false);
    showToast(`📋 Đã nạp mẫu: "${snippet.label}"`);
  };

  const applyImagePreset = (preset: typeof SAMPLE_IMAGE_PRESETS[0]) => {
    setImageTitle(preset.title);
    setImagePreviewUrl(preset.imageUrl);
    setImageCaption(preset.caption);
    setSelectedTopicId(preset.topicId);
    setIsCustomTopicMode(false);
    showToast(`🖼️ Đã chọn ảnh mẫu: "${preset.title}"`);
  };

  const applyUrlPreset = (preset: typeof SAMPLE_URL_PRESETS[0]) => {
    setUrlTitle(preset.title);
    setUrlLink(preset.url);
    setUrlDescription(preset.description);
    setSelectedTopicId(preset.topicId);
    setIsCustomTopicMode(false);
    showToast(`🔗 Đã nạp liên kết: "${preset.title}"`);
  };

  // Delete material from State & LocalStorage
  const handleDeleteMaterial = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học liệu "${title}"? Thao tác này sẽ cập nhật ngay vào LocalStorage.`)) {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      if (viewingItem?.id === id) setViewingItem(null);
      showToast(`🗑️ Đã xóa học liệu "${title}" khỏi LocalStorage.`);
    }
  };

  // Khôi phục danh sách mẫu ban đầu
  const handleResetToDefault = () => {
    if (window.confirm('Khôi phục danh sách nguồn học liệu về dữ liệu mẫu ban đầu? (Sẽ cập nhật lại LocalStorage)')) {
      if (onResetMaterials) {
        onResetMaterials();
      } else {
        const defaultList = resetStudyMaterialsToDefault();
        setMaterials(defaultList);
      }
      showToast('🔄 Đã khôi phục danh sách học liệu mẫu ban đầu trong LocalStorage!');
    }
  };

  // Filtered materials
  const filteredMaterials = materials.filter((item) => {
    const matchesType = listFilterType === 'all' || item.type === listFilterType;
    const matchesTopic = listFilterTopic === 'all' || item.topicId === listFilterTopic;
    return matchesType && matchesTopic;
  });

  const availableGrades = ['Tất cả', 'Hóa học 10', 'Hóa học 11', 'Hóa học 12'];

  const filteredTopics = STUDY_TOPIC_OPTIONS.filter((t) => {
    if (selectedGrade === 'Tất cả') return true;
    return t.grade === selectedGrade;
  });

  return (
    <div id="study-material-input-container" className="space-y-8">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#121624] text-white px-4 py-3 shadow-2xl border border-amber-500/50 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Screen Header - Champions Trophy Styling */}
      <div className="rounded-3xl bg-linear-to-br from-[#090b10] via-[#121624] to-[#1a111a] text-white p-6 sm:p-8 shadow-2xl border border-amber-500/35 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-72 w-72 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/40">
              <FolderPlus className="h-3.5 w-3.5" />
              Sổ Tay Ôn Thi Cá Nhân
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/25 px-3 py-1 text-xs font-bold text-rose-300 ring-1 ring-rose-500/40">
              <GraduationCap className="h-3.5 w-3.5" />
              Môn Hóa Học THPT
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black px-2.5 py-0.5 text-[11px] shadow-xs">
              Text-First • Nhập Nhanh
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Nhập Học Liệu Đầu Vào & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">Bài Ghi Chép</span>
          </h1>
          <p className="text-sm sm:text-base text-amber-100/90 mt-2 max-w-3xl leading-relaxed">
            Dành riêng cho bạn gom góp tài liệu học tập: dán nhanh nội dung ghi chép trên lớp, lưu ảnh chụp trang vở/sách giáo khoa, hoặc lưu trữ liên kết video bài giảng để ôn tập dễ dàng.
          </p>

          {/* 3 Step Student Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-amber-500/20 text-xs">
            <div className="flex items-center gap-2.5 bg-[#0e121d]/85 rounded-xl p-2.5 border border-amber-500/30">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">1</span>
              <span className="text-slate-200">Chọn khối lớp & bài học đang học</span>
            </div>
            <div className="flex items-center gap-2.5 bg-[#0e121d]/85 rounded-xl p-2.5 border border-rose-500/30">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">2</span>
              <span className="text-slate-200">Dán ghi chép (Text) hoặc tải ảnh/link</span>
            </div>
            <div className="flex items-center gap-2.5 bg-[#0e121d]/85 rounded-xl p-2.5 border border-amber-500/30">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/25 text-amber-300 font-bold border border-amber-400/30">3</span>
              <span className="text-slate-200">Lưu vào kho học liệu để xem lại</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Box: Topic Selection + Material Input */}
      <div className="rounded-3xl border border-amber-500/25 bg-[#0e121d] p-5 sm:p-7 shadow-xl shadow-black/60">
        
        {/* Step 1: Subject & Topic Selection Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs">
                1
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Chọn môn học & chủ đề bài đang học
              </h2>
            </div>

            {/* Quick grade selector */}
            <div className="flex items-center gap-1 bg-[#141826] p-1 rounded-xl text-xs font-semibold text-slate-400 border border-[#232a3d]">
              <span className="px-2 text-amber-300/80">Khối:</span>
              {availableGrades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(g)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedGrade === g
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black shadow-xs'
                      : 'hover:text-white hover:bg-white/5'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Cards / Selection */}
          <div className="mt-4">
            {!isCustomTopicMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredTopics.map((topic) => {
                  const isSelected = selectedTopicId === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={`text-left p-3 rounded-2xl border transition relative ${
                        isSelected
                          ? 'border-amber-400 bg-gradient-to-br from-[#1b2032] to-[#251828] ring-1 ring-amber-400/50 shadow-[0_0_15px_rgba(245,192,66,0.15)]'
                          : 'border-amber-500/15 bg-[#121624] hover:border-amber-400/40 hover:bg-[#161a2b]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{topic.iconEmoji}</span>
                          <div>
                            <span className="text-xs font-bold text-white block leading-snug">
                              {topic.title}
                            </span>
                            <span className="text-[11px] text-amber-300 font-medium">
                              {topic.grade}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
                        {topic.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-[#141826]">
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  ✏️ Tên bài học / chuyên đề bạn muốn tự đặt:
                </label>
                <input
                  type="text"
                  value={customTopicTitle}
                  onChange={(e) => setCustomTopicTitle(e.target.value)}
                  placeholder="Ví dụ: Bài 15: Axit photphoric và phân bón hóa học (Tiết 3)..."
                  className="w-full rounded-xl border border-amber-500/25 bg-[#0a0d15] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 outline-none"
                />
              </div>
            )}

            {/* Toggle custom topic button */}
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Đang gắn vào: <strong className="text-amber-300 font-bold">{getCurrentTopicTitle()}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsCustomTopicMode(!isCustomTopicMode)}
                className="text-amber-400 hover:text-amber-300 font-semibold underline"
              >
                {isCustomTopicMode ? '← Chọn lại từ danh sách có sẵn' : '+ Tự gõ tên bài học khác'}
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Choose Material Source Type (TEXT FIRST!) */}
        <div className="pt-4 border-t border-amber-500/20">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs">
                2
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Chọn hình thức học liệu bạn muốn thêm
              </h2>
            </div>
            <span className="text-xs text-amber-300/80 font-medium">
              Ưu tiên: Gõ / Dán văn bản nhanh
            </span>
          </div>

          {/* 3 Source Tabs - Champions Styled */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#0a0d15] border border-amber-500/25 mb-6">
            <button
              type="button"
              id="tab-source-text"
              onClick={() => setActiveInputType('text')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeInputType === 'text'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,192,66,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className={`h-4 w-4 ${activeInputType === 'text' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>1. Ghi chép (Text)</span>
              <span className={`hidden md:inline rounded-full px-2 py-0.2 text-[10px] font-black ${
                activeInputType === 'text' ? 'bg-slate-950 text-amber-300' : 'bg-amber-400/20 text-amber-300'
              }`}>
                Khuyên dùng
              </span>
            </button>

            <button
              type="button"
              id="tab-source-image"
              onClick={() => setActiveInputType('image')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeInputType === 'image'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,192,66,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon className={`h-4 w-4 ${activeInputType === 'image' ? 'text-slate-950' : 'text-rose-400'}`} />
              <span>2. Ảnh chụp vở / Sách</span>
            </button>

            <button
              type="button"
              id="tab-source-url"
              onClick={() => setActiveInputType('url')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeInputType === 'url'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,192,66,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Link2 className={`h-4 w-4 ${activeInputType === 'url' ? 'text-slate-950' : 'text-amber-300'}`} />
              <span>3. Liên kết bài giảng</span>
            </button>
          </div>

          {/* TAB 1: TEXT INPUT (TEXT-FIRST EXPERIENCE) */}
          {activeInputType === 'text' && (
            <form onSubmit={handleAddTextMaterial} className="space-y-4">
              
              {/* Quick Preset Buttons for Students */}
              <div className="rounded-2xl bg-[#141826] p-3.5 border border-amber-500/25">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <span>Mẹo dán nhanh: Bấm vào đây để thử ngay mẫu nội dung ôn tập:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_TEXT_SNIPPETS.map((snippet, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTextPreset(snippet)}
                      className="text-left text-xs bg-[#0b0e17] hover:bg-amber-400 hover:text-slate-950 text-slate-200 font-medium px-3 py-1.5 rounded-xl border border-amber-500/25 shadow-2xs transition flex items-center gap-1.5"
                    >
                      <Copy className="h-3 w-3 text-amber-400" />
                      <span>{snippet.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Tiêu đề ghi chép bài học:
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="Ví dụ: Tóm tắt lý thuyết phản ứng este hóa & điều kiện cần nhớ..."
                  className="w-full rounded-xl border border-amber-500/25 bg-[#0a0d15] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 outline-none"
                />
              </div>

              {/* Text content area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-200">
                    Nội dung bài ghi chép / Phương trình hóa học <span className="text-rose-500">*</span>:
                  </label>
                  <span className="text-[11px] text-amber-300/80 font-medium">
                    {textContent.trim() ? `${textContent.trim().split(/\s+/).length} từ` : '0 từ'}
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder={`Dán hoặc nhập ghi chép bài học vào đây...
Ví dụ:
1. Phản ứng este hóa:
CH3COOH + C2H5OH ⇄ CH3COOC2H5 + H2O (H2SO4 đặc, t°)
2. Hiện tượng:
Tách lớp chất lỏng, este có mùi thơm hoa quả chín nổi lên trên...`}
                  className="w-full rounded-2xl border border-amber-500/30 font-mono text-xs sm:text-sm p-4 text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 outline-none leading-relaxed bg-[#07090f]"
                  required
                />
              </div>

              {/* Optional note */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Ghi chú thêm cho bản thân (ví dụ: Lời dặn của giáo viên trên lớp):
                </label>
                <input
                  type="text"
                  value={textNote}
                  onChange={(e) => setTextNote(e.target.value)}
                  placeholder="Ví dụ: Thầy nhấn mạnh nhớ xem lại câu hỏi bài tập về este fomat có phản ứng tráng bạc..."
                  className="w-full rounded-xl border border-amber-500/20 bg-[#0a0d15] px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-amber-400 outline-none"
                />
              </div>

              {/* Submit button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTextTitle('');
                    setTextContent('');
                    setTextNote('');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  Xóa trắng
                </button>
                <button
                  type="submit"
                  id="btn-submit-text-material"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/25 transition active:scale-98"
                >
                  <PlusCircle className="h-4 w-4 stroke-[2.5]" />
                  <span>Lưu vào sổ tay ôn tập</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: IMAGE INPUT */}
          {activeInputType === 'image' && (
            <form onSubmit={handleAddImageMaterial} className="space-y-4">
              
              {/* Presets */}
              <div className="rounded-2xl bg-[#141826] p-3.5 border border-amber-500/25">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <span>Chưa có ảnh trên máy? Chọn ngay ảnh bài học mẫu để thử:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyImagePreset(preset)}
                      className="text-left text-xs bg-[#0b0e17] hover:bg-rose-600 hover:text-white text-slate-200 font-medium px-3 py-1.5 rounded-xl border border-rose-500/25 shadow-2xs transition flex items-center gap-1.5"
                    >
                      <ImageIcon className="h-3 w-3 text-rose-400" />
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Title */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Tiêu đề cho bức ảnh này:
                </label>
                <input
                  type="text"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  placeholder="Ví dụ: Ảnh chụp sơ đồ tư duy phản ứng hữu cơ trang 15..."
                  className="w-full rounded-xl border border-amber-500/25 bg-[#0a0d15] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 outline-none"
                />
              </div>

              {/* Drag and drop upload zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
                  isDragging
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-amber-500/30 hover:border-amber-400/60 bg-[#0a0d15]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />

                {imagePreviewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreviewUrl}
                      alt="Ảnh xem trước"
                      className="mx-auto max-h-56 rounded-xl object-contain shadow-md border border-amber-500/30"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
                      <span>✓ Đã chọn ảnh. Bấm vào đây để chọn ảnh khác</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="text-sm font-bold text-white">
                      Kéo thả ảnh chụp vào đây, hoặc <span className="text-amber-400 underline">bấm để chọn ảnh từ thiết bị</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Hỗ trợ ảnh chụp vở ghi, sơ đồ tư duy, sách bài tập (PNG, JPG, JPEG)
                    </p>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Chú thích ảnh (Trang sách bao nhiêu, ghi chú gì cần nhớ):
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Ví dụ: Bảng tóm tắt màu sắc các chất kết tủa trong chương kim loại..."
                  className="w-full rounded-xl border border-amber-500/20 bg-[#0a0d15] px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-amber-400 outline-none"
                />
              </div>

              {/* Submit image */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {imagePreviewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreviewUrl('');
                      setImageTitle('');
                      setImageCaption('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition"
                  >
                    Bỏ ảnh
                  </button>
                )}
                <button
                  type="submit"
                  id="btn-submit-image-material"
                  disabled={!imagePreviewUrl}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition shadow-lg ${
                    imagePreviewUrl
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/25'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Lưu ảnh vào sổ tay học tập</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: URL INPUT */}
          {activeInputType === 'url' && (
            <form onSubmit={handleAddUrlMaterial} className="space-y-4">
              
              {/* Presets */}
              <div className="rounded-2xl bg-[#141826] p-3.5 border border-amber-500/25">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <span>Bấm vào đây để nạp nhanh bài giảng mẫu:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_URL_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyUrlPreset(preset)}
                      className="text-left text-xs bg-[#0b0e17] hover:bg-amber-400 hover:text-slate-950 text-slate-200 font-medium px-3 py-1.5 rounded-xl border border-amber-500/25 shadow-2xs transition flex items-center gap-1.5"
                    >
                      <Link2 className="h-3 w-3 text-amber-400" />
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Tiêu đề bài giảng / bài đọc ôn tập:
                </label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Ví dụ: Video bài giảng giải bài toán este hóa nâng cao..."
                  className="w-full rounded-xl border border-amber-500/25 bg-[#0a0d15] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 outline-none"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Đường dẫn liên kết (Link YouTube, Vietjack, Olm, Web ôn thi) <span className="text-rose-500">*</span>:
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-amber-400/70">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={urlLink}
                    onChange={(e) => setUrlLink(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-amber-500/25 bg-[#0a0d15] pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Tóm tắt nội dung bài giảng để dễ tìm lại:
                </label>
                <input
                  type="text"
                  value={urlDescription}
                  onChange={(e) => setUrlDescription(e.target.value)}
                  placeholder="Ví dụ: Thầy giải chi tiết 15 câu este khó trong đề thi tốt nghiệp 2024..."
                  className="w-full rounded-xl border border-amber-500/20 bg-[#0a0d15] px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-amber-400 outline-none"
                />
              </div>

              {/* Submit URL */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  id="btn-submit-url-material"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/25 transition active:scale-98"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Lưu liên kết vào danh mục ôn tập</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* SECTION 3: DISPLAY ADDED MATERIALS LIST ("Kho Học Liệu Của Em") */}
      <div id="materials-list-section" className="rounded-3xl border border-amber-500/25 bg-[#0e121d] p-5 sm:p-7 shadow-xl shadow-black/60 space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs">
                3
              </span>
              <h2 className="text-lg font-bold text-white">
                Kho Học Liệu & Sổ Tay Của Em
              </h2>
              <span className="rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 px-2.5 py-0.5 text-xs font-bold">
                {materials.length} tài liệu
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LocalStorage: Tự động lưu
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dữ liệu được lưu trực tiếp trong LocalStorage trình duyệt — Giữ nguyên nội dung khi tải lại trang (F5).
            </p>
          </div>

          {/* Quick Filters & Reset */}
          <div className="flex items-center flex-wrap gap-2">
            {onGenerateSummaryFromMaterials && filteredMaterials.length > 0 && (
              <button
                type="button"
                onClick={() => onGenerateSummaryFromMaterials(filteredMaterials)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,192,66,0.3)] hover:brightness-110 transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                <span>Tạo Summary & Key Points ({filteredMaterials.length} nguồn)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetToDefault}
              title="Khôi phục danh sách học liệu mẫu ban đầu vào LocalStorage"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-300 hover:bg-white/5 border border-amber-500/25 transition active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              <span>Khôi phục mẫu</span>
            </button>

            {/* Filter by type */}
            <div className="flex items-center gap-1 bg-[#141826] p-1 rounded-xl text-xs font-semibold text-slate-400 border border-[#232a3d]">
              <button
                type="button"
                onClick={() => setListFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  listFilterType === 'all'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black shadow-xs'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                Tất cả ({materials.length})
              </button>
              <button
                type="button"
                onClick={() => setListFilterType('text')}
                className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                  listFilterType === 'text'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black shadow-xs'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                <span>📝 Văn bản</span>
              </button>
              <button
                type="button"
                onClick={() => setListFilterType('image')}
                className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                  listFilterType === 'image'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white font-black shadow-xs'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                <span>📸 Ảnh</span>
              </button>
              <button
                type="button"
                onClick={() => setListFilterType('url')}
                className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                  listFilterType === 'url'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black shadow-xs'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                <span>🔗 Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* Materials Grid / List Cards */}
        {filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map((item) => {
              const isText = item.type === 'text';
              const isImage = item.type === 'image';
              const isUrl = item.type === 'url';

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-amber-500/20 bg-[#121624] p-4 sm:p-5 flex flex-col justify-between hover:border-amber-400/50 hover:bg-[#161a2b] transition shadow-lg group"
                >
                  <div>
                    {/* Header line: badges */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] text-amber-400/90 bg-[#0c0f18] px-1.5 py-0.5 rounded border border-amber-500/20 font-bold tracking-tight">
                          #{item.id}
                        </span>
                        {isText && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 text-xs font-bold text-amber-300">
                            <FileText className="h-3 w-3" />
                            Ghi chép (Text)
                          </span>
                        )}
                        {isImage && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-600/25 border border-rose-500/40 px-2 py-0.5 text-xs font-bold text-rose-300">
                            <ImageIcon className="h-3 w-3" />
                            Ảnh chụp vở
                          </span>
                        )}
                        {isUrl && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-yellow-500/20 border border-yellow-500/30 px-2 py-0.5 text-xs font-bold text-yellow-300">
                            <Link2 className="h-3 w-3" />
                            Liên kết bài học
                          </span>
                        )}

                        <span className="text-[11px] font-medium text-slate-300 bg-[#1a1f33] px-2 py-0.5 rounded-md border border-amber-500/15">
                          {item.topicTitle}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-400/70" />
                        {item.createdAt}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition leading-snug">
                      {item.title}
                    </h3>

                    {/* Content Preview */}
                    <div className="mt-2.5">
                      {isText && (
                        <div className="rounded-xl bg-[#080a11] p-3 border border-amber-500/15 font-mono text-xs text-slate-200 line-clamp-4 leading-relaxed">
                          {item.content}
                        </div>
                      )}

                      {isImage && (
                        <div className="rounded-xl overflow-hidden border border-amber-500/25 bg-[#080a11]">
                          <img
                            src={item.content}
                            alt={item.title}
                            className="h-36 w-full object-cover group-hover:scale-102 transition duration-300"
                          />
                        </div>
                      )}

                      {isUrl && (
                        <div className="rounded-xl bg-[#080a11] p-3 border border-amber-500/20 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-mono text-amber-300 truncate font-semibold">
                              {item.content}
                            </div>
                            {item.noteOrCaption && (
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                {item.noteOrCaption}
                              </p>
                            )}
                          </div>
                          <a
                            href={item.content}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition shrink-0"
                            title="Mở liên kết"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Optional Note caption */}
                    {item.noteOrCaption && isText && (
                      <p className="text-[11px] text-amber-200/70 italic mt-2 line-clamp-1">
                        💬 Ghi chú: {item.noteOrCaption}
                      </p>
                    )}
                    {item.noteOrCaption && isImage && (
                      <p className="text-[11px] text-rose-300/80 mt-2 line-clamp-1">
                        🏷️ {item.noteOrCaption}
                      </p>
                    )}
                  </div>

                  {/* Card actions */}
                  <div className="mt-4 pt-3 border-t border-amber-500/15 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setViewingItem(item)}
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-slate-950 bg-[#191e30] hover:bg-gradient-to-r hover:from-amber-400 hover:to-yellow-400 px-3 py-1.5 rounded-xl border border-amber-500/30 transition shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Xem nội dung</span>
                      </button>

                      {onGenerateSummaryFromMaterials && (
                        <button
                          type="button"
                          onClick={() => onGenerateSummaryFromMaterials([item])}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 px-3 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
                          title="Tạo ngay Summary & Key Points từ nguồn học liệu này và lưu vào LocalStorage"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Tạo Summary & Key Points</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(item.id, item.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                      title="Xóa học liệu này"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-amber-500/25 bg-[#0a0d15]/50">
            <BookOpen className="h-10 w-10 text-amber-400/50 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-200">
              Chưa có học liệu nào trong bộ lọc này
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Hãy dán ghi chép bài học đầu tiên, tải ảnh chụp vở hoặc dán liên kết bài giảng ở form phía trên để bắt đầu lưu trữ nhé!
            </p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL FOR VIEWING MATERIAL */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0f121e] p-6 sm:p-7 shadow-2xl border border-amber-500/40 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-amber-500/20 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-lg">
                    {viewingItem.type === 'text' && '📝 Ghi chép bài học'}
                    {viewingItem.type === 'image' && '📸 Ảnh chụp tài liệu'}
                    {viewingItem.type === 'url' && '🔗 Liên kết bài giảng'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {viewingItem.topicTitle} ({viewingItem.grade})
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {viewingItem.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Display */}
            <div>
              {viewingItem.type === 'text' && (
                <div className="rounded-2xl bg-[#07090f] p-4 border border-amber-500/20 font-mono text-xs sm:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {viewingItem.content}
                </div>
              )}

              {viewingItem.type === 'image' && (
                <div className="rounded-2xl overflow-hidden border border-amber-500/25 bg-[#07090f] text-center">
                  <img
                    src={viewingItem.content}
                    alt={viewingItem.title}
                    className="max-h-[60vh] mx-auto object-contain"
                  />
                </div>
              )}

              {viewingItem.type === 'url' && (
                <div className="rounded-2xl bg-[#0b0e17] p-4 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-semibold text-amber-300">
                    Đường dẫn bài giảng:
                  </div>
                  <a
                    href={viewingItem.content}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm text-amber-400 hover:underline break-all flex items-center gap-1.5 font-bold"
                  >
                    <span>{viewingItem.content}</span>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </a>
                </div>
              )}

              {viewingItem.noteOrCaption && (
                <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200">
                  <strong className="text-amber-400">Ghi chú học sinh:</strong> {viewingItem.noteOrCaption}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-amber-500/20 text-xs text-slate-400">
              <span>Đã lưu vào: {viewingItem.createdAt}</span>
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 transition"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
