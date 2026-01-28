import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Collab } from '@/data/demoData';

interface EditCollabModalProps {
  collab: Collab;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    type: string;
    dateStart: string;
    dateEnd?: string;
    time?: string;
    method: 'offline' | 'online';
    address?: string;
    onlineInfo?: string;
    region: string;
    notes?: string;
  }) => void;
}

export function EditCollabModal({ collab, open, onOpenChange, onSubmit }: EditCollabModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [time, setTime] = useState('');
  const [method, setMethod] = useState<'offline' | 'online'>('offline');
  const [address, setAddress] = useState('');
  const [onlineInfo, setOnlineInfo] = useState('');
  const [region, setRegion] = useState('');
  const [notes, setNotes] = useState('');

  // Initialize form when collab changes
  useEffect(() => {
    if (collab) {
      setTitle(collab.title);
      setType(collab.type);
      setDateRange({
        from: new Date(collab.dateStart),
        to: collab.dateEnd ? new Date(collab.dateEnd) : undefined,
      });
      setTime(collab.time || '');
      setMethod(collab.method);
      setAddress(collab.address || '');
      setOnlineInfo(collab.onlineInfo || '');
      setRegion(collab.region);
      setNotes(collab.notes || '');
    }
  }, [collab]);

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }
    if (!dateRange?.from) {
      alert('일시를 선택해주세요');
      return;
    }
    if (method === 'offline' && !address.trim()) {
      alert('오프라인 장소를 입력해주세요');
      return;
    }
    
    onSubmit({
      title: title.trim(),
      type: type || '기타',
      dateStart: format(dateRange.from, 'yyyy-MM-dd'),
      dateEnd: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      time: time.trim() || undefined,
      method,
      address: method === 'offline' ? address.trim() : undefined,
      onlineInfo: method === 'online' ? onlineInfo.trim() : undefined,
      region: region.trim() || '전국',
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-foreground">협업 수정</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="h-px bg-border" />

          <div className="space-y-3">
            {/* 제목 */}
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <div className="text-sm text-muted-foreground">제목</div>
              <input
                type="text"
                className="glass-input w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            {/* 유형 */}
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <div className="text-sm text-muted-foreground">유형</div>
              <select
                className="glass-input w-full appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">유형 선택</option>
                <option value="통합 대회">통합 대회</option>
                <option value="연합 포럼">연합 포럼</option>
                <option value="공동 연구">공동 연구</option>
                <option value="기타">기타</option>
              </select>
            </div>
            
            {/* 일시 */}
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <div className="text-sm text-muted-foreground">일시</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'M월 d일', { locale: ko })} ~ {format(dateRange.to, 'M월 d일', { locale: ko })}
                        </>
                      ) : (
                        format(dateRange.from, 'yyyy년 M월 d일', { locale: ko })
                      )
                    ) : (
                      <span>날짜 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border z-50" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={ko}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 시간 */}
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <div className="text-sm text-muted-foreground">시간</div>
              <input
                type="text"
                className="glass-input w-full"
                placeholder="선택사항 (예: 14:00)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            {/* 방법 */}
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <div className="text-sm text-muted-foreground">방법</div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={method === 'offline' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setMethod('offline')}
                >
                  오프라인
                </Button>
                <Button
                  type="button"
                  variant={method === 'online' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setMethod('online')}
                >
                  온라인
                </Button>
              </div>
            </div>

            {/* 오프라인 주소 */}
            {method === 'offline' && (
              <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                <div className="text-sm text-muted-foreground">장소</div>
                <input
                  type="text"
                  className="glass-input w-full"
                  placeholder="구체적인 주소 입력"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            )}

            {/* 온라인 정보 */}
            {method === 'online' && (
              <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                <div className="text-sm text-muted-foreground pt-2">접속 정보</div>
                <textarea
                  className="glass-input w-full min-h-[80px] resize-none"
                  placeholder="회의 링크, ID, 비밀번호 등 자유롭게 입력"
                  value={onlineInfo}
                  onChange={(e) => setOnlineInfo(e.target.value)}
                />
              </div>
            )}
            
            {/* 지역 */}
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <div className="text-sm text-muted-foreground">지역</div>
              <input
                type="text"
                className="glass-input w-full"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>

            {/* 기타 사항 */}
            <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
              <div className="text-sm text-muted-foreground pt-2">기타</div>
              <textarea
                className="glass-input w-full min-h-[60px] resize-none"
                placeholder="추가로 안내할 사항"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleSubmit}>저장</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
