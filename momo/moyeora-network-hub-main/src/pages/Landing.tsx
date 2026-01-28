import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { LandingNetworkCanvas } from '@/components/LandingNetworkCanvas';

interface LandingProps {
  onSignup: () => void;
  onTryDemo: () => void;
}

export function Landing({ onSignup, onTryDemo }: LandingProps) {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Network Background */}
      <div className="absolute inset-0 pointer-events-none">
        <LandingNetworkCanvas />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-border shadow-sm mb-8">
          <span className="text-sm text-muted-foreground font-medium">전국을 연결하는 네트워크</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
          <span className="text-foreground">동아리 활동의</span>
          <br />
          <span className="text-primary">새로운 차원.</span>
        </h1>

        {/* Description */}
        <p className="text-base md:text-lg text-muted-foreground mb-10 leading-relaxed">
          전국 고등학교 동아리들이 모여라에서 만나고 협력하며 성장합니다.
          <br />
          대회, 포럼, 공동연구까지 한 곳에서 경험하세요.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={onSignup}
            className="px-8 py-6 text-base"
          >
            회원 가입하기
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onTryDemo}
            className="px-8 py-6 text-base"
          >
            체험해보기
          </Button>
        </div>
        
        <p className="mt-4 text-xs text-muted-foreground">
          체험해보기로 가입 없이 기능을 둘러볼 수 있어요
        </p>
      </div>
    </div>
  );
}
