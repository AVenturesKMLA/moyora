
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t bg-muted/20 mt-auto py-10">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">프래그머티즘(Pragmatism)</h3>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <p>대표: 조슈아 | 사업자등록번호: 414-24-02372</p>
                            <p>고객센터: 070-xxxx-xxxx</p>
                            <p>E-Mail: 5070joshua@gmail.com</p>
                            <p>주소: 경기도 고양시 일산서구 강선로 71, 712동(주엽동)</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            © 2026 Moyora. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
