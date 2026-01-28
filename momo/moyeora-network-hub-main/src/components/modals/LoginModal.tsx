import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Club } from '@/data/demoData';
import { Search, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubs?: Club[];
  onClubJoinRequest?: (clubId: string) => void;
  initialMode?: 'login' | 'signup';
  onAuthSuccess?: () => void;
}

type AuthMode = 'login' | 'signup';

// Comprehensive school list
const SCHOOL_LIST = [
  // 영재고등학교
  '서울과학고등학교 (서울특별시)',
  '경기과학고등학교 (경기도)',
  '대전과학고등학교 (대전광역시)',
  '광주과학고등학교 (광주광역시)',
  '대구과학고등학교 (대구광역시)',
  '인천과학예술영재학교 (인천광역시)',
  '세종과학예술영재학교 (세종특별자치시)',
  '한국과학영재학교 (부산광역시)',
  // 과학고
  '세종과학고등학교',
  '한성과학고등학교',
  '인천과학고등학교',
  '인천진산과학고등학교',
  '대전동신과학고등학교',
  '대구일과학고등학교',
  '울산과학고등학교',
  '부산과학고등학교',
  '부산일과학고등학교',
  '경기북과학고등학교',
  '강원과학고등학교',
  '충남과학고등학교',
  '충북과학고등학교',
  '전남과학고등학교',
  '전북과학고등학교',
  '경남과학고등학교',
  '창원과학고등학교',
  '경북과학고등학교',
  '경산과학고등학교',
  '제주과학고등학교',
  // 외국어고
  '대원외국어고등학교',
  '대일외국어고등학교',
  '명덕외국어고등학교',
  '서울외국어고등학교',
  '이화여자외국어고등학교',
  '한영외국어고등학교',
  '미추홀외국어고등학교',
  '인천외국어고등학교',
  '대전외국어고등학교',
  '대구외국어고등학교',
  '울산외국어고등학교',
  '부산국제외국어고등학교',
  '부산외국어고등학교',
  '부일외국어고등학교',
  '경기외국어고등학교',
  '고양외국어고등학교',
  '과천외국어고등학교',
  '김포외국어고등학교',
  '동두천외국어고등학교',
  '성남외국어고등학교',
  '수원외국어고등학교',
  '안양외국어고등학교',
  '강원외국어고등학교',
  '충남외국어고등학교',
  '청주외국어고등학교',
  '전남외국어고등학교',
  '전북외국어고등학교',
  '경남외국어고등학교',
  '김해외국어고등학교',
  '경북외국어고등학교',
  '제주외국어고등학교',
  // 국제고
  '서울국제고등학교',
  '인천국제고등학교',
  '부산국제고등학교',
  '세종국제고등학교',
  '고양국제고등학교',
  '동탄국제고등학교',
  '청심국제고등학교',
  // 서울 자율형 사립고등학교
  '경희고등학교',
  '대광고등학교',
  '배재고등학교',
  '보인고등학교',
  '선덕고등학교',
  '세화고등학교',
  '세화여자고등학교',
  '신일고등학교',
  '양정고등학교',
  '중동고등학교',
  '중앙고등학교',
  '한가람고등학교',
  '한대부속고등학교',
  '현대고등학교',
  // 전국단위/기타 지역 자율형 사립고등학교
  '하나고등학교 (서울)',
  '용인한국외국어대학교부설고등학교 (경기)',
  '민족사관고등학교 (강원)',
  '상산고등학교 (전북)',
  '광양제철고등학교 (전남)',
  '김천고등학교 (경북)',
  '북일고등학교 (충남)',
  '포항제철고등학교 (경북)',
  '인천하늘고등학교 (인천)',
  '현대청운고등학교 (울산)',
];

export function LoginModal({ open, onOpenChange, clubs = [], onClubJoinRequest, initialMode = 'login', onAuthSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [clubName, setClubName] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [clubSearch, setClubSearch] = useState('');
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  
  const { signIn, signUp, isLoading } = useAuth();

  // Sync mode with initialMode when modal opens
  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  const resetForm = () => {
    setEmail('');
    setEmailError('');
    setPassword('');
    setPasswordConfirm('');
    setPasswordError('');
    setPasswordConfirmError('');
    setShowPassword(false);
    setShowPasswordConfirm(false);
    setName('');
    setSchool('');
    setSchoolSearch('');
    setClubName('');
    setSelectedClubId('');
    setClubSearch('');
  };

  // Filter schools based on search
  const filteredSchools = useMemo(() => {
    if (!schoolSearch.trim()) return SCHOOL_LIST.slice(0, 5);
    return SCHOOL_LIST.filter(s => 
      s.toLowerCase().includes(schoolSearch.toLowerCase())
    ).slice(0, 5);
  }, [schoolSearch]);

  // Filter clubs based on search
  const filteredClubs = useMemo(() => {
    if (!clubSearch.trim()) return clubs.slice(0, 5);
    return clubs.filter(c => 
      c.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
      c.school.toLowerCase().includes(clubSearch.toLowerCase())
    ).slice(0, 5);
  }, [clubs, clubSearch]);

  // Password validation
  const validatePassword = (pwd: string): boolean => {
    const hasEnglish = /[a-zA-Z]/.test(pwd);
    const isLongEnough = pwd.length >= 8;
    
    if (!isLongEnough) {
      setPasswordError('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }
    if (!hasEnglish) {
      setPasswordError('비밀번호에 영문자가 포함되어야 합니다.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    if (pwd.length > 0) {
      validatePassword(pwd);
    } else {
      setPasswordError('');
    }
  };

  // Email validation
  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      setEmailError('');
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'login') {
      const result = await signIn(email, password);
      if (result.success) {
        toast({ title: '로그인 성공', description: '환영합니다!' });
        resetForm();
        onOpenChange(false);
        onAuthSuccess?.();
      } else {
        toast({ title: '로그인 실패', description: result.error, variant: 'destructive' });
      }
    } else {
      if (!email || !password || !name || !school) {
        toast({ title: '입력 오류', description: '필수 항목을 모두 입력해주세요.', variant: 'destructive' });
        return;
      }
      
      if (!validatePassword(password)) {
        return;
      }

      if (password !== passwordConfirm) {
        setPasswordConfirmError('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      // Get club name from selected club or manual input
      const finalClubName = selectedClubId 
        ? clubs.find(c => c.id === selectedClubId)?.name 
        : clubName;
      
      const result = await signUp({ email, password, name, school, clubName: finalClubName || undefined });
      if (result.success) {
        toast({ title: '가입 완료', description: '회원가입이 완료되었습니다!' });
        resetForm();
        onOpenChange(false);
        onAuthSuccess?.();
      } else {
        toast({ title: '가입 실패', description: result.error, variant: 'destructive' });
      }
    }
  };

  const handleClubJoinRequest = () => {
    if (selectedClubId && onClubJoinRequest) {
      onClubJoinRequest(selectedClubId);
      toast({ 
        title: '권한 요청 전송', 
        description: '동아리 관리자에게 권한 요청이 전송되었습니다.' 
      });
    }
  };

  const handleSchoolSelect = (schoolName: string) => {
    setSchool(schoolName);
    setSchoolSearch(schoolName);
    setShowSchoolDropdown(false);
  };

  const handleClubSelect = (club: Club) => {
    setSelectedClubId(club.id);
    setClubSearch(`${club.name} (${club.school})`);
    setClubName('');
    setShowClubDropdown(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-foreground">
            {mode === 'login' ? '로그인' : '회원가입'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  placeholder="조슈아"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2 relative">
                <Label htmlFor="school">학교 *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="school"
                    placeholder="예) 민족사관고등학교"
                    className="pl-9"
                    value={schoolSearch}
                    onChange={(e) => {
                      setSchoolSearch(e.target.value);
                      setSchool(e.target.value);
                      setShowSchoolDropdown(true);
                    }}
                    onFocus={() => setShowSchoolDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
                    required
                  />
                </div>
                {showSchoolDropdown && filteredSchools.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredSchools.map(s => (
                      <button
                        key={s}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                        onClick={() => handleSchoolSelect(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2 relative">
                <Label htmlFor="clubSelect">기존 동아리 부원으로 참가하기</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="clubSelect"
                    placeholder="동아리 검색..."
                    className="pl-9"
                    value={clubSearch}
                    onChange={(e) => {
                      setClubSearch(e.target.value);
                      setSelectedClubId('');
                      setShowClubDropdown(true);
                    }}
                    onFocus={() => setShowClubDropdown(true)}
                    onBlur={() => setTimeout(() => setShowClubDropdown(false), 200)}
                  />
                </div>
                {showClubDropdown && filteredClubs.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredClubs.map(club => (
                      <button
                        key={club.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                        onClick={() => handleClubSelect(club)}
                      >
                        <div className="font-medium">{club.name}</div>
                        <div className="text-xs text-muted-foreground">{club.school}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {selectedClubId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-primary border-primary hover:bg-primary/10"
                    onClick={handleClubJoinRequest}
                  >
                    🙋 내 동아리에요!
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clubName">동아리 등록하기</Label>
                <Input
                  id="clubName"
                  placeholder="예) 어벤처스(A;VENTURES)"
                  value={clubName}
                  onChange={(e) => {
                    setClubName(e.target.value);
                    if (e.target.value) {
                      setSelectedClubId('');
                      setClubSearch('');
                    }
                  }}
                  disabled={!!selectedClubId}
                />
                <p className="text-xs text-muted-foreground">
                  새 동아리를 등록하려면 한글(영어) 형식으로 입력하세요
                </p>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">이메일 *</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@school.kr"
              value={email}
              onChange={handleEmailChange}
              required
            />
            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
            {!emailError && email && email.includes('@') && (
              <p className="text-xs text-green-600">✓ 올바른 이메일 형식입니다</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호 *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="영문 포함 8자 이상"
                className="pr-10"
                value={password}
                onChange={handlePasswordChange}
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-destructive">{passwordError}</p>
            )}
            {mode === 'signup' && !passwordError && password.length >= 8 && (
              <p className="text-xs text-green-600">✓ 사용 가능한 비밀번호입니다</p>
            )}
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인 *</Label>
              <div className="relative">
                <Input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력해주세요"
                  className="pr-10"
                  value={passwordConfirm}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value);
                    if (e.target.value && e.target.value !== password) {
                      setPasswordConfirmError('비밀번호가 일치하지 않습니다.');
                    } else {
                      setPasswordConfirmError('');
                    }
                  }}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordConfirmError && (
                <p className="text-xs text-destructive">{passwordConfirmError}</p>
              )}
              {!passwordConfirmError && passwordConfirm && passwordConfirm === password && (
                <p className="text-xs text-green-600">✓ 비밀번호가 일치합니다</p>
              )}
            </div>
          )}
          
          <Button type="submit" className="w-full" variant="primary" disabled={isLoading}>
            {isLoading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
          </Button>
        </form>
        
        <div className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              계정이 없으신가요?{' '}
              <button 
                type="button"
                onClick={switchMode} 
                className="text-primary hover:underline font-medium"
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{' '}
              <button 
                type="button"
                onClick={switchMode} 
                className="text-primary hover:underline font-medium"
              >
                로그인
              </button>
            </>
          )}
        </div>
        
        <div className="mt-2 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
          <strong>데모 모드:</strong> 테스트 계정 - 5070joshua@gmail.com / 123456
        </div>
      </DialogContent>
    </Dialog>
  );
}
