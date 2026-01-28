'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Bell, User, LogOut, LayoutDashboard, Calendar, Users } from 'lucide-react';

interface NavBarProps {
    showDashboardLink?: boolean;
    onHeroToggle?: () => void;
    heroMode?: 'default' | 'network';
}

function NotificationButton() {
    const { unreadCount } = useNotifications();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <NotificationDropdown />
        </DropdownMenu>
    );
}

export default function NavBar({ showDashboardLink = true }: NavBarProps) {
    const { data: session } = useSession();
    const isLoggedIn = !!session?.user;

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <div className="mr-8 flex items-center gap-2">
                    <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 font-bold">
                        <Image src="/moyora.svg" alt="Moyora Logo" width={32} height={32} className="rounded-lg" />
                        <span className="text-xl">모여라</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex md:flex-1 md:items-center md:gap-6">
                    <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
                        회사소개
                    </Link>
                    <Link href="/#plans" className="text-sm font-medium transition-colors hover:text-primary">
                        플랜
                    </Link>
                    {isLoggedIn && (
                        <>
                            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                                대시보드
                            </Link>
                            <Link href="/collab" className="text-sm font-medium transition-colors hover:text-primary">
                                협업
                            </Link>
                        </>
                    )}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Auth & Notifications (Desktop) */}
                    <div className="hidden md:flex md:items-center md:gap-2">
                        {isLoggedIn ? (
                            <>
                                <NotificationButton />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                                                <AvatarFallback>{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {session?.user?.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard" className="cursor-pointer">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                <span>대시보드</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/mypage" className="cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>마이페이지</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/club/register" className="cursor-pointer">
                                                <Users className="mr-2 h-4 w-4" />
                                                <span>동아리 등록</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleSignOut}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>로그아웃</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" asChild>
                                    <Link href="/login">로그인</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/signup">회원가입</Link>
                                </Button>
                            </div>
                        )}
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu */}
                    <div className="flex md:hidden">
                        <ThemeToggle />
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="ml-2">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle>메뉴</SheetTitle>
                                </SheetHeader>
                                <div className="mt-8 flex flex-col gap-4">
                                    {isLoggedIn ? (
                                        <>
                                            <div className="mb-4 flex items-center gap-4 rounded-lg border p-4">
                                                <Avatar>
                                                    <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{session?.user?.name}</span>
                                                    <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                                                </div>
                                            </div>
                                            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-medium">
                                                <LayoutDashboard className="h-5 w-5" />
                                                대시보드
                                            </Link>
                                            <Link href="/collab" className="flex items-center gap-2 text-lg font-medium">
                                                <Users className="h-5 w-5" />
                                                협업
                                            </Link>
                                            <Link href="/mypage" className="flex items-center gap-2 text-lg font-medium">
                                                <User className="h-5 w-5" />
                                                마이페이지
                                            </Link>
                                            <div className="my-2 border-t" />
                                            <button onClick={handleSignOut} className="flex items-center gap-2 text-lg font-medium text-red-600">
                                                <LogOut className="h-5 w-5" />
                                                로그아웃
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/login" className="text-lg font-medium">
                                                로그인
                                            </Link>
                                            <Link href="/signup" className="text-lg font-medium text-primary">
                                                회원가입
                                            </Link>
                                        </>
                                    )}
                                    <div className="my-2 border-t" />
                                    <Link href="/about" className="text-lg font-medium">
                                        회사소개
                                    </Link>
                                    <Link href="/#plans" className="text-lg font-medium">
                                        플랜
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
