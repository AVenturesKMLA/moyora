import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Club } from '@/data/demoData';
import { Send } from 'lucide-react';

interface ProposalEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetClub: Club | null;
  senderName?: string;
  senderEmail?: string;
}

export function ProposalEmailModal({ 
  open, 
  onOpenChange, 
  targetClub,
  senderName = '',
  senderEmail = ''
}: ProposalEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ 
        title: '입력 오류', 
        description: '제목과 내용을 모두 입력해주세요.', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSending(true);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast({ 
      title: '제안 전송 완료', 
      description: `${targetClub?.name}에게 협업 제안이 전송되었습니다.` 
    });
    
    setSubject('');
    setMessage('');
    setIsSending(false);
    onOpenChange(false);
  };

  if (!targetClub) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-foreground flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            협업 제안 보내기
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/30 text-sm">
            <div className="text-muted-foreground">받는 동아리</div>
            <div className="font-bold text-foreground mt-1">
              {targetClub.name} · {targetClub.school}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {targetClub.email}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">제목 *</Label>
            <Input
              id="subject"
              placeholder="예) 공동 프로젝트 협업 제안드립니다"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">내용 *</Label>
            <Textarea
              id="message"
              placeholder="협업 제안 내용을 작성해주세요..."
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {senderName && (
            <div className="text-xs text-muted-foreground">
              보내는 사람: {senderName} ({senderEmail})
            </div>
          )}

          <Button 
            variant="primary" 
            className="w-full" 
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? '전송 중...' : '제안 보내기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
