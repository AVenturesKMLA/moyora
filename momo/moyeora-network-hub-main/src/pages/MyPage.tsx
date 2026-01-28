import { useState } from 'react';
import { DemoUser } from '@/hooks/useAuth';
import { DemoState, Club, saveState } from '@/data/demoData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { User, School, Users, FolderOpen, FileText, Calendar, Mail, Phone, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MyPageProps {
  user: DemoUser | null;
  state: DemoState;
  onUpdateClub?: (clubId: string, updates: Partial<Club>) => void;
}

interface OrgMember {
  role: string;
  name: string;
}

export function MyPage({ user, state, onUpdateClub }: MyPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Club> & { orgChart?: OrgMember[] }>({});
  const [newTag, setNewTag] = useState('');

  if (!user) {
    return (
      <div className="container py-8 animate-fade-in">
        <div className="panel p-8 text-center">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">로그인이 필요합니다</h2>
          <p className="text-muted-foreground mb-4">마이페이지를 보려면 먼저 로그인해주세요.</p>
          <Button variant="primary" asChild>
            <Link to="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Find user's club from demo data (match by clubName or school)
  const myClub = state.clubs.find(
    c => c.name === user.clubName || c.school === user.school
  );

  // Find projects the user might be part of
  const myProjects = state.projects.filter(
    p => myClub && p.members.includes(myClub.name)
  );

  // Find open collabs from user's club
  const myCollabs = state.collabs.filter(
    c => myClub && c.club_id === myClub.id
  );

  // Default org chart if not set
  const defaultOrgChart: OrgMember[] = myClub ? [
    { role: '동아리장', name: myClub.leader },
    { role: '부동아리장', name: '' },
    { role: '총무', name: '' },
  ] : [];

  const startEditing = () => {
    if (myClub) {
      const storedOrgChart = localStorage.getItem(`orgChart_${myClub.id}`);
      const orgChart = storedOrgChart ? JSON.parse(storedOrgChart) : defaultOrgChart;
      
      setEditForm({
        leader: myClub.leader,
        phone: myClub.phone,
        email: myClub.email,
        description: myClub.description,
        tags: [...myClub.tags],
        size: myClub.size,
        orgChart,
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
    setNewTag('');
  };

  const saveChanges = () => {
    if (myClub && onUpdateClub) {
      const { orgChart, ...clubUpdates } = editForm;
      onUpdateClub(myClub.id, clubUpdates);
      if (orgChart) {
        localStorage.setItem(`orgChart_${myClub.id}`, JSON.stringify(orgChart));
      }
      toast({ title: '저장 완료', description: '동아리 정보가 업데이트되었습니다.' });
    } else if (myClub) {
      const { orgChart, ...clubUpdates } = editForm;
      const updatedClubs = state.clubs.map(c => 
        c.id === myClub.id ? { ...c, ...clubUpdates } : c
      );
      const newState = { ...state, clubs: updatedClubs };
      saveState(newState);
      if (orgChart) {
        localStorage.setItem(`orgChart_${myClub.id}`, JSON.stringify(orgChart));
      }
      toast({ title: '저장 완료', description: '동아리 정보가 업데이트되었습니다. 페이지를 새로고침하면 반영됩니다.' });
    }
    setIsEditing(false);
    setNewTag('');
  };

  const addTag = () => {
    if (newTag.trim() && editForm.tags && !editForm.tags.includes(newTag.trim())) {
      setEditForm({ ...editForm, tags: [...editForm.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (editForm.tags) {
      setEditForm({ ...editForm, tags: editForm.tags.filter(t => t !== tagToRemove) });
    }
  };

  const addOrgMember = () => {
    const orgChart = editForm.orgChart || [];
    setEditForm({ ...editForm, orgChart: [...orgChart, { role: '', name: '' }] });
  };

  const updateOrgMember = (index: number, field: 'role' | 'name', value: string) => {
    const orgChart = [...(editForm.orgChart || [])];
    orgChart[index] = { ...orgChart[index], [field]: value };
    setEditForm({ ...editForm, orgChart });
  };

  const removeOrgMember = (index: number) => {
    const orgChart = (editForm.orgChart || []).filter((_, i) => i !== index);
    setEditForm({ ...editForm, orgChart });
  };

  // Load org chart for display
  const displayOrgChart: OrgMember[] = myClub 
    ? JSON.parse(localStorage.getItem(`orgChart_${myClub.id}`) || 'null') || defaultOrgChart
    : [];

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      {/* Profile Section */}
      <section className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-foreground">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Badge variant="accent">회원</Badge>
        </div>
        
        <div className="panel-body">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
              <School className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">소속 학교</div>
                <div className="font-semibold text-foreground">{user.school}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">동아리명</div>
                <div className="font-semibold text-foreground">{user.clubName || '미등록'}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">가입일</div>
                <div className="font-semibold text-foreground">
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Club Section */}
      {myClub && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="font-extrabold text-foreground">나의 동아리</h2>
              <p className="text-sm text-muted-foreground mt-1">동아리 상세 정보</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={myClub.trust >= 85 ? 'trust_high' : myClub.trust >= 75 ? 'trust_mid' : 'trust_low'}>
                신뢰 {myClub.trust}
              </Badge>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Edit className="w-4 h-4" />
                  수정
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button variant="primary" size="sm" onClick={saveChanges}>
                    <Save className="w-4 h-4" />
                    저장
                  </Button>
                  <Button variant="ghost" size="sm" onClick={cancelEditing}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="panel-body space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground">{myClub.name}</h3>
              <div className="text-sm text-muted-foreground">
                {myClub.school} · {myClub.region} · {isEditing ? (
                  <Input
                    type="number"
                    value={editForm.size || 0}
                    onChange={(e) => setEditForm({ ...editForm, size: parseInt(e.target.value) || 0 })}
                    className="inline-block w-16 h-6 text-sm px-2"
                    min={1}
                  />
                ) : myClub.size}명
              </div>
            </div>

            {/* Club Description */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">동아리 소개</div>
              {isEditing ? (
                <Textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="동아리 소개를 입력하세요"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-foreground bg-muted/20 p-3 rounded-xl">
                  {myClub.description}
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-border">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" /> 동아리장
                </div>
                {isEditing ? (
                  <Input
                    value={editForm.leader || ''}
                    onChange={(e) => setEditForm({ ...editForm, leader: e.target.value })}
                    placeholder="동아리장 이름"
                    className="h-8 text-sm"
                  />
                ) : (
                  <div className="font-semibold text-foreground">{myClub.leader}</div>
                )}
              </div>
              
              <div className="p-3 rounded-xl border border-border">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> 이메일
                </div>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="이메일"
                    className="h-8 text-sm"
                  />
                ) : (
                  <div className="font-semibold text-foreground text-sm">{myClub.email}</div>
                )}
              </div>
              
              <div className="p-3 rounded-xl border border-border">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> 전화번호
                </div>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="전화번호"
                    className="h-8 text-sm"
                  />
                ) : (
                  <div className="font-semibold text-foreground">{myClub.phone}</div>
                )}
              </div>
            </div>
            
            {/* Tags / 분야 */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">분야</div>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {(editForm.tags || []).map(tag => (
                      <span key={tag} className="tag flex items-center gap-1">
                        {tag}
                        <button 
                          onClick={() => removeTag(tag)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="새 분야 추가"
                      className="h-8 text-sm flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button variant="outline" size="sm" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-1.5 flex-wrap">
                  {myClub.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Organization Chart */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">조직도</div>
              {isEditing ? (
                <div className="space-y-2">
                  {(editForm.orgChart || []).map((member, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={member.role}
                        onChange={(e) => updateOrgMember(index, 'role', e.target.value)}
                        placeholder="직책 (예: 동아리장)"
                        className="h-8 text-sm flex-1"
                      />
                      <Input
                        value={member.name}
                        onChange={(e) => updateOrgMember(index, 'name', e.target.value)}
                        placeholder="이름"
                        className="h-8 text-sm flex-1"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeOrgMember(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addOrgMember}>
                    <Plus className="w-4 h-4 mr-1" />
                    직책 추가
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-2">
                  {displayOrgChart.filter(m => m.name).map((member, index) => (
                    <div key={index} className="p-2 rounded-lg bg-muted/20 text-sm">
                      <div className="text-xs text-muted-foreground">{member.role}</div>
                      <div className="font-semibold text-foreground">{member.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground mb-2">포트폴리오</div>
              <ul className="space-y-1 text-sm text-foreground">
                {myClub.portfolio.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* My Projects Section */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="font-extrabold text-foreground">진행 중인 프로젝트</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {myProjects.length > 0 ? `${myProjects.length}개의 프로젝트` : '참여 중인 프로젝트가 없습니다'}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/projects">전체 보기</Link>
          </Button>
        </div>
        
        <div className="panel-body">
          {myProjects.length > 0 ? (
            <div className="space-y-3">
              {myProjects.map(project => (
                <div key={project.id} className="p-3 rounded-xl border border-border card-hover">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-foreground">{project.title}</h4>
                    <Badge variant="success">진행 {project.progress}%</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    참여: {project.members.join(', ')}
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    다음 액션: {project.next}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>참여 중인 프로젝트가 없습니다.</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/collab">협업 찾아보기</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* My Collabs Section */}
      {myCollabs.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="font-extrabold text-foreground">모집 중인 협업</h2>
              <p className="text-sm text-muted-foreground mt-1">내 동아리에서 모집하는 협업</p>
            </div>
          </div>
          
          <div className="panel-body space-y-3">
            {myCollabs.map(collab => {
              const formatDate = (start: string, end?: string) => {
                const startDate = new Date(start);
                if (end) {
                  const endDate = new Date(end);
                  return `${startDate.getMonth() + 1}/${startDate.getDate()}~${endDate.getMonth() + 1}/${endDate.getDate()}`;
                }
                return `${startDate.getMonth() + 1}월 ${startDate.getDate()}일`;
              };
              
              return (
                <div key={collab.id} className="p-3 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-foreground">{collab.title}</h4>
                    <Badge variant="accent">{collab.status === 'open' ? 'OPEN' : '종료'}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {collab.type} · {collab.region} · {formatDate(collab.dateStart, collab.dateEnd)}
                  </div>
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    <span className="tag">{collab.method === 'offline' ? '오프라인' : '온라인'}</span>
                    {collab.time && <span className="tag">{collab.time}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
