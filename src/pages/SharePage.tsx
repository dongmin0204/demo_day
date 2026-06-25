import { useNavigate } from 'react-router';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { RiskBadge } from '@/components/common/RiskBadge';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { getRiskSupportTags } from '@/utils/risk';
import { buildShareText, formatSessionDate, groupSessionItems } from '@/utils/share';

const CARD = 'rounded-2xl border border-[#ECEFF3] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.14em] text-gray-400';

export default function SharePage() {
  const navigate = useNavigate();
  const { state } = useAnalysisContext();

  const session = state.currentSession;

  if (!session) {
    return (
      <PageContainer title="결과 공유" showBackButton showBottomNav={false}>
        <div className="flex flex-col items-center py-20">
          <p className="text-gray-400">공유할 결과가 없습니다.</p>
          <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate(-1)}>
            뒤로 가기
          </Button>
        </div>
      </PageContainer>
    );
  }

  const date = new Date(session.createdAt);
  const dateStr = formatSessionDate(date);
  const { drugs, foods, supplements } = groupSessionItems(session);
  const shareText = buildShareText(session);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast('결과를 복사했어요.');
    } catch {
      toast('복사에 실패했어요.', {
        description: '브라우저 권한을 확인해 주세요.',
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '약 조심 - 분석 결과',
          text: shareText,
        });
      } catch {
        handleCopyText();
      }
    } else {
      handleCopyText();
    }
  };

  const rows: [string, number, string[]][] = [
    ['약물', drugs.length, drugs.map((i) => i.name)],
    ['음식', foods.length, foods.map((i) => i.name)],
    ['영양제', supplements.length, supplements.map((i) => i.name)],
  ];

  return (
    <PageContainer title="결과 공유" showBackButton showBottomNav={false}>
      <div className="space-y-4">
        {/* Preview card */}
        <div className={`${CARD} p-5`}>
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground">약 조심</p>
            <p className="font-mono text-[11px] text-gray-400">{dateStr}</p>
          </div>

          <div className="mt-4">
            <p className={LABEL}>선택 항목</p>
            <div className="mt-2 space-y-1.5">
              {rows.map(([label, count, names]) => (
                <div key={label} className="flex gap-2 text-[13px]">
                  <span className="shrink-0 text-gray-400">
                    {label} ({count})
                  </span>
                  <span className="text-gray-700">{count > 0 ? names.join(', ') : '없음'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {session.results.map((result) => (
              <div
                key={result.id}
                className="flex items-start gap-2.5 rounded-xl border border-[#EFEFF1] bg-[#FBFBFC] p-3"
              >
                <RiskBadge severity={result.severity} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium tracking-[-0.01em] text-foreground">
                    {result.rule.subjectName} + {result.rule.objectName}
                  </p>
                  {getRiskSupportTags(result).length > 0 && (
                    <p className="mt-1 font-mono text-[11px] text-orange-700">
                      {getRiskSupportTags(result).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {session.results.length === 0 && (
              <div className="rounded-xl border border-[#EFEFF1] bg-[#FBFBFC] p-3">
                <p className="text-[14px] font-medium text-foreground">확인 정보 없음</p>
                <p className="mt-1 text-[12px] text-gray-500">
                  선택한 조합에 대해 확인된 상호작용 정보가 없습니다.
                </p>
              </div>
            )}
          </div>

          <p className="mt-4 border-t border-[#EFEFF1] pt-3 text-[11px] leading-[1.55] text-gray-400">
            본 정보는 의료 진단을 대체하지 않습니다. 복약 관련 결정은 반드시 의사·약사와 상담하세요.
          </p>
        </div>

        {/* Share options */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full rounded-2xl" onClick={handleCopyText}>
            <Copy className="mr-2 h-4 w-4" />
            텍스트 복사
          </Button>
          <Button className="w-full rounded-2xl" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            공유하기
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
